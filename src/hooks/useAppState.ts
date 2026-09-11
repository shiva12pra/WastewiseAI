// ==========================================
// WasteWiseAI — Main Application State Hook
// ==========================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Bin, Truck, EventLog, ScenarioType, RouteRecommendation } from '../types';
import { binsData } from '../data/bins';
import { trucksData } from '../data/trucks';
import { scenariosData } from '../data/scenarios';
import { initialEvents } from '../data/events';
import { applyScenarioToBins, calculateRiskScore, getPriority } from '../utils/riskScoring';
import { generateOptimizedRoute } from '../utils/routeOptimization';
import { formatTruckId } from '../utils/truckDisplay';

export function useAppState() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('normal');
  const [selectedBinId, setSelectedBinId] = useState<string | null>('BIN-104');
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [route, setRoute] = useState<RouteRecommendation | null>(null);
  const [routeApproved, setRouteApproved] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>(trucksData);
  const [activeNav, setActiveNav] = useState('overview');
  const [simulationActive, setSimulationActive] = useState(true);

  const scenario = useMemo(() => {
    return scenariosData.find(s => s.type === activeScenario) || scenariosData[0];
  }, [activeScenario]);

  // Maintain bin state that reacts to scenario changes and live simulation ticks
  const [bins, setBins] = useState<Bin[]>(() => applyScenarioToBins(binsData, 1.0));

  const addEvent = useCallback((message: string, type: EventLog['type'] = 'info') => {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setEvents(prev => [
      { id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, timestamp: ts, message, type },
      ...prev,
    ].slice(0, 30));
  }, []);

  // Update bins whenever activeScenario changes
  useEffect(() => {
    const updatedBins = applyScenarioToBins(binsData, scenario.fillRateMultiplier);
    setBins(updatedBins);
    // Keep or reset selected bin to highest risk bin
    const highestRiskBin = [...updatedBins].sort((a, b) => b.riskScore - a.riskScore)[0];
    setSelectedBinId(highestRiskBin ? highestRiskBin.id : 'BIN-104');
  }, [activeScenario, scenario.fillRateMultiplier]);

  // Real-time lightweight simulation tick (every 3.5s)
  useEffect(() => {
    if (!simulationActive) return;

    const timer = setInterval(() => {
      setBins(prevBins => {
        // Target: selected bin or a high priority bin below 98%
        const targetBin = prevBins.find(b => b.id === selectedBinId && b.fillLevel < 99)
          || prevBins.find(b => b.priority === 'critical' && b.fillLevel < 99)
          || prevBins.find(b => b.fillLevel < 95);

        if (!targetBin) return prevBins;

        return prevBins.map(b => {
          if (b.id === targetBin.id) {
            const newFill = Math.min(100, b.fillLevel + 1);
            const updated = { ...b, fillLevel: newFill };
            const newRisk = calculateRiskScore(updated, scenario.fillRateMultiplier);
            const newPriority = getPriority(newRisk);
            const adjRate = b.fillRate * scenario.fillRateMultiplier;

            if (newFill === 90 && b.fillLevel < 90) {
              addEvent(`${b.id} crossed critical 90% threshold at ${b.location}`, 'critical');
            }

            return {
              ...updated,
              fillLevel: newFill,
              riskScore: newRisk,
              priority: newPriority,
              predictedFill6h: Math.min(100, Math.round(newFill + adjRate * 6)),
              predictedFill12h: Math.min(100, Math.round(newFill + adjRate * 12)),
            };
          }
          return b;
        });
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [simulationActive, selectedBinId, scenario.fillRateMultiplier, addEvent]);

  const criticalBins = useMemo(() => {
    return [...bins].filter(b => b.riskScore >= 60).sort((a, b) => b.riskScore - a.riskScore);
  }, [bins]);

  const selectedBin = useMemo(() => {
    return bins.find(b => b.id === selectedBinId) || bins[0];
  }, [bins, selectedBinId]);

  const kpis = useMemo(() => {
    const critical = bins.filter(b => b.priority === 'critical' || b.priority === 'high').length;
    const active = trucks.filter(t => t.status === 'on-route' || t.status === 'recommended').length;
    return {
      totalBins: bins.length,
      criticalBins: critical,
      activeTrucks: active,
      totalTrucks: trucks.length,
      collectionEfficiency: activeScenario === 'normal' ? 88 : activeScenario === 'festival' ? 73 : activeScenario === 'heavy-rain' ? 76 : 82,
      routeSaving: route ? Math.round(route.estimatedDistance * 0.28) : 29,
    };
  }, [bins, trucks, activeScenario, route]);

  const selectBin = useCallback((binId: string | null) => {
    setSelectedBinId(binId);
    if (binId) {
      addEvent(`Operator inspected bin telemetry: ${binId}`, 'info');
    }
  }, [addEvent]);

  const changeScenario = useCallback((scenarioType: ScenarioType) => {
    setActiveScenario(scenarioType);
    setRoute(null);
    setRouteApproved(false);

    const sc = scenariosData.find(s => s.type === scenarioType);
    if (sc && scenarioType !== 'normal') {
      addEvent(`Scenario activated: ${sc.label}`, 'warning');
      if (sc.wasteGenerationIncrease > 0) {
        addEvent(`Waste generation surge: +${sc.wasteGenerationIncrease}% across commercial sectors`, 'warning');
      }
    } else {
      addEvent('Operating mode reset to Normal Day (baseline patterns)', 'info');
    }

    if (scenarioType === 'truck-unavailable') {
      setTrucks(prev => prev.map(t =>
        t.id === 'EV-02' ? { ...t, status: 'unavailable' as const } : t
      ));
      addEvent(`${formatTruckId('EV-02')} marked down for scheduled depot maintenance`, 'critical');
    } else {
      setTrucks(trucksData);
    }
  }, [addEvent]);

  const generateRoute = useCallback(() => {
    const unavailableTruck = activeScenario === 'truck-unavailable' ? 'EV-02' : undefined;
    const newRoute = generateOptimizedRoute(bins, trucks, unavailableTruck);

    if (newRoute) {
      setRoute(newRoute);
      setRouteApproved(false);

      // Update truck status
      setTrucks(prev => prev.map(t =>
        t.id === newRoute.truckId
          ? { ...t, status: 'recommended' as const, assignedBins: newRoute.bins }
          : t
      ));

      const truckLabel = formatTruckId(newRoute.truckId);
      addEvent(`AI Route Engine: Generated optimal dispatch path for ${truckLabel}`, 'success');
      addEvent(`Path collects ${newRoute.bins.length} critical bins across ${newRoute.estimatedDistance} km in ${newRoute.estimatedTime} min`, 'info');
    } else {
      addEvent('Unable to generate feasible route — all suitable vehicles dispatched', 'critical');
    }
  }, [bins, trucks, activeScenario, addEvent]);

  // Quick Dispatch directly from map popup or bin detail panel
  const dispatchBin = useCallback((binId: string) => {
    setSelectedBinId(binId);
    const unavailableTruck = activeScenario === 'truck-unavailable' ? 'EV-02' : undefined;
    const newRoute = generateOptimizedRoute(bins, trucks, unavailableTruck, binId);

    if (newRoute) {
      setRoute(newRoute);
      setRouteApproved(true);

      setTrucks(prev => prev.map(t =>
        t.id === newRoute.truckId
          ? { ...t, status: 'on-route' as const, assignedBins: newRoute.bins }
          : t
      ));

      const truckLabel = formatTruckId(newRoute.truckId);
      addEvent(`Quick Dispatch Activated: ${truckLabel} expedited to collect ${binId} and nearby high-risk bins`, 'success');
    } else {
      addEvent(`Unable to dispatch collection for ${binId} — fleet at maximum load`, 'critical');
    }
  }, [bins, trucks, activeScenario, addEvent]);

  const approveRoute = useCallback(() => {
    if (!route) return;
    setRouteApproved(true);
    setTrucks(prev => prev.map(t =>
      t.id === route.truckId
        ? { ...t, status: 'on-route' as const }
        : t
    ));
    const truckLabel = formatTruckId(route.truckId);
    addEvent(`Route Approved by Dispatcher: ${truckLabel} en route to ${route.bins.length} stops`, 'success');
  }, [route, addEvent]);

  const rejectRoute = useCallback(() => {
    if (!route) return;
    const truckLabel = formatTruckId(route.truckId);
    setTrucks(prev => prev.map(t =>
      t.id === route.truckId
        ? { ...t, status: 'idle' as const, assignedBins: [] }
        : t
    ));
    setRoute(null);
    setRouteApproved(false);
    addEvent(`Route assignment for ${truckLabel} returned to pool`, 'warning');
  }, [route, addEvent]);

  const toggleSimulation = useCallback(() => {
    setSimulationActive(prev => {
      const next = !prev;
      addEvent(`Telemetry simulation ${next ? 'resumed' : 'paused'}`, 'info');
      return next;
    });
  }, [addEvent]);

  return {
    bins,
    trucks,
    events,
    kpis,
    criticalBins,
    selectedBin,
    selectedBinId,
    selectBin,
    route,
    routeApproved,
    generateRoute,
    dispatchBin,
    approveRoute,
    rejectRoute,
    activeScenario,
    scenario,
    changeScenario,
    activeNav,
    setActiveNav,
    simulationActive,
    toggleSimulation,
  };
}
