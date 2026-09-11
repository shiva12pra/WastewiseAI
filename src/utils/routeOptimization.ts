// ==========================================
// WasteWiseAI — Route Optimization (Simulated)
// ==========================================

import { Bin, Truck, RouteRecommendation, Scenario } from '../types';
import { formatTruckId } from './truckDisplay';

/**
 * Simple nearest-neighbor route builder.
 * Picks highest-risk bins, assigns them to best truck.
 */
export function generateOptimizedRoute(
  bins: Bin[],
  trucks: Truck[],
  unavailableTruckId?: string,
  targetBinId?: string
): RouteRecommendation | null {
  // Sort bins by risk score descending
  let criticalBins = [...bins]
    .filter(b => b.riskScore >= 60)
    .sort((a, b) => b.riskScore - a.riskScore);

  // If a specific target bin is designated (e.g. via Quick Dispatch), ensure it is first in line
  if (targetBinId) {
    const target = bins.find(b => b.id === targetBinId);
    if (target) {
      criticalBins = [target, ...criticalBins.filter(b => b.id !== targetBinId)];
    }
  }

  const selectedStops = criticalBins.slice(0, 5);
  if (selectedStops.length === 0) return null;

  // Find best truck: available, sufficient battery/fuel, lowest load
  const available = trucks.filter(t => {
    if (unavailableTruckId && t.id === unavailableTruckId) return false;
    if (t.status === 'charging' || t.status === 'near-capacity' || t.status === 'unavailable') return false;
    if (t.type === 'ev' && t.battery < 25) return false;
    if (t.load >= 90) return false;
    return true;
  });

  if (available.length === 0) return null;

  // Score trucks: prefer lower load + higher battery + proximity to first bin
  const scoredTrucks = available.map(truck => {
    const dist = haversine(truck.lat, truck.lng, selectedStops[0].lat, selectedStops[0].lng);
    const batteryScore = truck.type === 'ev' ? truck.battery / 100 : 1;
    const loadScore = 1 - truck.load / 100;
    const proximityScore = 1 - Math.min(dist / 5, 1);
    return {
      truck,
      score: batteryScore * 0.3 + loadScore * 0.4 + proximityScore * 0.3,
    };
  });

  scoredTrucks.sort((a, b) => b.score - a.score);
  const bestTruck = scoredTrucks[0].truck;

  // Build simple route using nearest-neighbor
  const routeBins = buildNearestNeighborRoute(bestTruck, selectedStops);

  // Estimate distance and time
  const totalDistance = estimateRouteDistance(bestTruck, routeBins);
  const estimatedTime = Math.round(totalDistance * 2.3); // ~2.3 min/km in city
  const loadIncrease = routeBins.length * 4.5; // approx 4.5% load per bin
  const batteryUsage = bestTruck.type === 'ev' ? Math.round(totalDistance * 0.8) : 0; // 0.8%/km for EV

  return {
    truckId: bestTruck.id,
    bins: routeBins.map(b => b.id),
    estimatedDistance: parseFloat(totalDistance.toFixed(1)),
    estimatedTime,
    startLoad: bestTruck.load,
    endLoad: Math.min(100, Math.round(bestTruck.load + loadIncrease)),
    startBattery: bestTruck.battery,
    endBattery: Math.max(0, bestTruck.battery - batteryUsage),
    reasoning: generateRouteReasoning(bestTruck, routeBins, totalDistance),
  };
}

function buildNearestNeighborRoute(truck: Truck, bins: Bin[]): Bin[] {
  const route: Bin[] = [];
  const remaining = [...bins];
  let currentLat = truck.lat;
  let currentLng = truck.lng;

  while (remaining.length > 0) {
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(currentLat, currentLng, remaining[i].lat, remaining[i].lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }
    route.push(remaining[nearest]);
    currentLat = remaining[nearest].lat;
    currentLng = remaining[nearest].lng;
    remaining.splice(nearest, 1);
  }

  return route;
}

function estimateRouteDistance(truck: Truck, bins: Bin[]): number {
  let total = 0;
  let prevLat = truck.lat;
  let prevLng = truck.lng;

  for (const bin of bins) {
    // Multiply haversine by 1.3 to account for roads (not straight-line)
    total += haversine(prevLat, prevLng, bin.lat, bin.lng) * 1.3;
    prevLat = bin.lat;
    prevLng = bin.lng;
  }

  // Ensure minimum realistic distance
  return Math.max(total, 4 + bins.length * 2.5);
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateRouteReasoning(truck: Truck, bins: Bin[], distance: number): string {
  const highRiskCount = bins.filter(b => b.riskScore >= 80).length;
  const medRiskCount = bins.length - highRiskCount;
  const parts: string[] = [];

  parts.push(`Serves ${bins.length} high-priority bins`);
  if (highRiskCount > 0) parts.push(`including ${highRiskCount} critical`);
  parts.push(`using ${formatTruckId(truck.id)} with optimal capacity reserve`);
  parts.push(`across ${distance.toFixed(1)} km`);
  if (medRiskCount > 0) parts.push('while consolidating nearby medium-risk bins');
  parts.push('to avoid additional collection trips');

  return parts.join(' ');
}

export function getRouteCoordinates(
  truck: Truck,
  bins: Bin[],
  binIds: string[]
): [number, number][] {
  const coords: [number, number][] = [[truck.lat, truck.lng]];
  for (const id of binIds) {
    const bin = bins.find(b => b.id === id);
    if (bin) coords.push([bin.lat, bin.lng]);
  }
  return coords;
}

export function getComparisonMetrics(route: RouteRecommendation, truck: Truck) {
  const fixedDistance = Math.round(route.estimatedDistance * 1.35);
  const fixedTrips = route.bins.length <= 3 ? route.bins.length : Math.ceil(route.bins.length / 2) + 1;
  const optimizedTrips = 1;
  const fixedTime = Math.round(route.estimatedTime * 1.4);
  const distReduction = (((fixedDistance - route.estimatedDistance) / fixedDistance) * 100).toFixed(1);

  const isEV = truck.type === 'ev';
  const fixedEnergy = isEV ? `${(fixedDistance * 0.18).toFixed(1)} kWh` : `${(fixedDistance * 0.12).toFixed(1)} L`;
  const optEnergy = isEV ? `${(route.estimatedDistance * 0.18).toFixed(1)} kWh` : `${(route.estimatedDistance * 0.12).toFixed(1)} L`;
  const fixedCO2 = isEV ? `${(fixedDistance * 0.05).toFixed(1)} kg` : `${(fixedDistance * 0.27).toFixed(1)} kg`;
  const optCO2 = isEV ? `${(route.estimatedDistance * 0.05).toFixed(1)} kg` : `${(route.estimatedDistance * 0.27).toFixed(1)} kg`;

  const fixedCritical = Math.max(1, route.bins.length - 2);
  const optCritical = route.bins.length;
  const criticalDiff = Math.max(0, optCritical - fixedCritical);

  return [
    { metric: 'Distance', fixed: `${fixedDistance} km`, optimized: `${route.estimatedDistance} km`, improvement: `-${distReduction}%` },
    { metric: 'Collection Trips', fixed: `${fixedTrips}`, optimized: `${optimizedTrips}`, improvement: `${fixedTrips - optimizedTrips} fewer` },
    { metric: 'Critical Bins Served', fixed: `${fixedCritical}`, optimized: `${optCritical}`, improvement: `+${criticalDiff}` },
    { metric: 'Estimated Time', fixed: `${fixedTime} min`, optimized: `${route.estimatedTime} min`, improvement: `-${Math.round(((fixedTime - route.estimatedTime) / fixedTime) * 100)}%` },
    { metric: 'Fleet Energy / Fuel', fixed: fixedEnergy, optimized: optEnergy, improvement: `-${distReduction}%` },
    { metric: 'Est. Scope 1 CO₂', fixed: fixedCO2, optimized: optCO2, improvement: `-${distReduction}%` },
  ];
}

export interface DynamicImpactData {
  impactMetrics: {
    metric: string;
    category: string;
    fixed: string;
    optimized: string;
    improvement: string;
    isPositive: boolean;
    fixedNum: number;
    optNum: number;
    unit: string;
    notes: string;
  }[];
  chartData: {
    name: string;
    Fixed: number;
    WasteWiseAI: number;
  }[];
  summary: {
    distanceSavedKm: number;
    distanceSavedPct: number;
    co2SavedKg: number;
    tripsReductionPct: number;
    overflowPreventionPct: number;
  };
}

/**
 * Dynamically calculates simulated comparison between Traditional Fixed Route and WasteWiseAI
 * based on the active scenario, current route recommendation, and fleet state.
 */
export function calculateImpactComparison(
  route: RouteRecommendation | null,
  scenario: Scenario,
  trucks: Truck[]
): DynamicImpactData {
  const mult = scenario.fillRateMultiplier || 1.0;
  const isTraffic = scenario.type === 'traffic';
  const isRain = scenario.type === 'heavy-rain';

  // Base distances in km
  const baseFixedDist = Math.round(140 * mult * (isTraffic ? 1.1 : 1.0));
  const baseOptDist = route
    ? Math.round(route.estimatedDistance * 5.2 + (mult - 1) * 20)
    : Math.round(89 * (1 + (mult - 1) * 0.4));

  const distanceDiff = baseFixedDist - baseOptDist;
  const distancePct = Math.round(((baseFixedDist - baseOptDist) / baseFixedDist) * 100);

  // Trips
  const fixedTrips = Math.round(8 * (mult > 1.2 ? 1.25 : 1.0));
  const optTrips = route ? Math.max(3, Math.min(6, Math.ceil(route.bins.length * 0.8))) : 4;
  const tripsReductionPct = Math.round(((fixedTrips - optTrips) / fixedTrips) * 100);

  // Prevention rate
  const fixedPrevention = mult > 1.4 ? 54.0 : 64.0;
  const optPrevention = mult > 1.4 ? 96.5 : 98.5;

  // Fleet utilization
  const activeTruckCount = trucks.filter(t => t.status === 'on-route' || t.status === 'recommended').length;
  const fleetUtilFixed = 48.0;
  const fleetUtilOpt = Math.min(92.0, Math.round(76.0 + (activeTruckCount / (trucks.length || 1)) * 20));

  // Time in hours
  const timeFactor = isTraffic ? 1.35 : isRain ? 1.2 : 1.0;
  const fixedHours = parseFloat((6.4 * mult * timeFactor).toFixed(1));
  const optHours = parseFloat((4.1 * (1 + (mult - 1) * 0.35) * (isTraffic ? 1.15 : 1.0)).toFixed(1));
  const timeSavedPct = Math.round(((fixedHours - optHours) / fixedHours) * 100);

  // Energy in kWh equivalent
  const fixedEnergy = Math.round(baseFixedDist * 0.82);
  const optEnergy = Math.round(baseOptDist * 0.81);
  const energySavedPct = Math.round(((fixedEnergy - optEnergy) / fixedEnergy) * 100);

  // CO2 in kg
  const fixedCO2 = parseFloat((baseFixedDist * 0.30).toFixed(1));
  const optCO2 = parseFloat((baseOptDist * 0.205).toFixed(1));
  const co2SavedKg = parseFloat((fixedCO2 - optCO2).toFixed(1));
  const co2Pct = Math.round(((fixedCO2 - optCO2) / fixedCO2) * 100);

  const impactMetrics = [
    {
      metric: 'Total Distance Travelled',
      category: 'Operations',
      fixed: `${baseFixedDist} km`,
      optimized: `${baseOptDist} km`,
      improvement: `-${distancePct}%`,
      isPositive: true,
      fixedNum: baseFixedDist,
      optNum: baseOptDist,
      unit: 'km',
      notes: 'Eliminates redundant sweeps of low-fill residential sectors',
    },
    {
      metric: 'Daily Collection Trips',
      category: 'Operations',
      fixed: `${fixedTrips} trips`,
      optimized: `${optTrips} trips`,
      improvement: `-${tripsReductionPct}%`,
      isPositive: true,
      fixedNum: fixedTrips,
      optNum: optTrips,
      unit: 'trips',
      notes: 'Demand-driven consolidation into full payloads',
    },
    {
      metric: 'Critical Bins Served Pre-Overflow',
      category: 'Service Level',
      fixed: `${fixedPrevention.toFixed(1)}%`,
      optimized: `${optPrevention.toFixed(1)}%`,
      improvement: `+${(optPrevention - fixedPrevention).toFixed(1)}%`,
      isPositive: true,
      fixedNum: fixedPrevention,
      optNum: optPrevention,
      unit: '%',
      notes: 'Predictive alerts dispatch before citizen complaints or street overflow',
    },
    {
      metric: 'Fleet Utilization Rate',
      category: 'Fleet Logistics',
      fixed: `${fleetUtilFixed.toFixed(1)}%`,
      optimized: `${fleetUtilOpt.toFixed(1)}%`,
      improvement: `+${(fleetUtilOpt - fleetUtilFixed).toFixed(1)}%`,
      isPositive: true,
      fixedNum: fleetUtilFixed,
      optNum: fleetUtilOpt,
      unit: '%',
      notes: 'Payload-to-capacity alignment prevents empty collection sweeps',
    },
    {
      metric: 'Total Collection Hours',
      category: 'Operations',
      fixed: `${fixedHours} hrs`,
      optimized: `${optHours} hrs`,
      improvement: `-${timeSavedPct}%`,
      isPositive: true,
      fixedNum: fixedHours,
      optNum: optHours,
      unit: 'hours',
      notes: 'Optimized stop sequencing reduces travel lag and transit wait times',
    },
    {
      metric: 'Estimated Fleet Energy Consumption',
      category: 'Fleet Operations',
      fixed: `${fixedEnergy} kWh eq`,
      optimized: `${optEnergy} kWh eq`,
      improvement: `-${energySavedPct}%`,
      isPositive: true,
      fixedNum: fixedEnergy,
      optNum: optEnergy,
      unit: 'kWh eq',
      notes: 'Preserves vehicle operational range across full daily shifts',
    },
    {
      metric: 'Estimated Scope 1 Direct CO₂',
      category: 'Environmental',
      fixed: `${fixedCO2} kg CO2e`,
      optimized: `${optCO2} kg CO2e`,
      improvement: `-${co2Pct}%`,
      isPositive: true,
      fixedNum: fixedCO2,
      optNum: optCO2,
      unit: 'kg CO2e',
      notes: 'Combined priority routing and reduced total municipal kilometers',
    },
  ];

  const chartData = [
    { name: 'Distance (km)', Fixed: baseFixedDist, WasteWiseAI: baseOptDist },
    { name: 'Trips (count × 10)', Fixed: fixedTrips * 10, WasteWiseAI: optTrips * 10 },
    { name: 'Served Pre-Overflow (%)', Fixed: Math.round(fixedPrevention), WasteWiseAI: Math.round(optPrevention) },
    { name: 'Fleet Utilization (%)', Fixed: Math.round(fleetUtilFixed), WasteWiseAI: Math.round(fleetUtilOpt) },
    { name: 'Collection Time (hrs × 10)', Fixed: Math.round(fixedHours * 10), WasteWiseAI: Math.round(optHours * 10) },
  ];

  return {
    impactMetrics,
    chartData,
    summary: {
      distanceSavedKm: distanceDiff,
      distanceSavedPct: distancePct,
      co2SavedKg,
      tripsReductionPct,
      overflowPreventionPct: parseFloat((optPrevention - fixedPrevention).toFixed(1)),
    },
  };
}
