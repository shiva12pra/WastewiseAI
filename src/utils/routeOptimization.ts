// ==========================================
// WasteWiseAI — Route Optimization (Simulated)
// ==========================================

import { Bin, Truck, RouteRecommendation } from '../types';

/**
 * Simple nearest-neighbor route builder.
 * Picks highest-risk bins, assigns them to best truck.
 */
export function generateOptimizedRoute(
  bins: Bin[],
  trucks: Truck[],
  unavailableTruckId?: string
): RouteRecommendation | null {
  // Sort bins by risk score descending
  const criticalBins = [...bins]
    .filter(b => b.riskScore >= 60)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  if (criticalBins.length === 0) return null;

  // Find best truck: available, sufficient battery, lowest load
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
    const dist = haversine(truck.lat, truck.lng, criticalBins[0].lat, criticalBins[0].lng);
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
  const routeBins = buildNearestNeighborRoute(bestTruck, criticalBins);

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
  if (truck.type === 'ev') {
    parts.push(`using ${truck.id} with ${truck.battery}% battery`);
  }
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

  return [
    { metric: 'Distance', fixed: `${fixedDistance} km`, optimized: `${route.estimatedDistance} km`, improvement: `${distReduction}%` },
    { metric: 'Collection Trips', fixed: `${fixedTrips}`, optimized: `${optimizedTrips}`, improvement: `${fixedTrips - optimizedTrips} fewer` },
    { metric: 'Critical Bins Served', fixed: `${Math.max(1, route.bins.length - 2)}`, optimized: `${route.bins.length}`, improvement: `+${Math.min(2, route.bins.length - 1)}` },
    { metric: 'Estimated Time', fixed: `${fixedTime} min`, optimized: `${route.estimatedTime} min`, improvement: `${Math.round(((fixedTime - route.estimatedTime) / fixedTime) * 100)}%` },
    { metric: isEV ? 'Energy Usage' : 'Fuel Usage', fixed: fixedEnergy, optimized: optEnergy, improvement: `${distReduction}%` },
    { metric: 'Est. CO₂', fixed: fixedCO2, optimized: optCO2, improvement: `${distReduction}%` },
  ];
}
