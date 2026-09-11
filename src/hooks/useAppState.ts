// ==========================================
// WasteWiseAI — Main Application State Hook
// ==========================================

import { useState, useCallback, useMemo } from 'react';
import { Bin, Truck, EventLog, ScenarioType, RouteRecommendation } from '../types';
import { binsData } from '../data/bins';
import { trucksData } from '../data/trucks';
import { scenariosData } from '../data/scenarios';
import { initialEvents } from '../data/events';
import { applyScenarioToBins } from '../utils/riskScoring';
import { generateOptimizedRoute } from '../utils/routeOptimization';

export function useAppState() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('normal');
  const [selectedBinId, setSelectedBinId] = useState<string | null>('BIN-104');
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [route, setRoute] = useState<RouteRecommendation | null>(null);
  const [routeApproved, setRouteApproved] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>(trucksData);
  const [activeNav, setActiveNav] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const scenario = scenariosData.find(s => s.type === activeScenario) || scenariosData[0];

  const bins: Bin[] = useMemo(() => {
    return applyScenarioToBins(binsData, scenario.fillRateMultiplier);
  }, [activeScenario, scenario.fillRateMultiplier]);

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

  const addEvent = useCallback((message: string, type: EventLog['type'] = 'info') => {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setEvents(prev => [
      { id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, timestamp: ts, message, type },
      ...prev,
    ].slice(0, 30));
  }, []);

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
      addEvent('EV-02 marked down for depot battery maintenance', 'critical');
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

      addEvent(`AI Route Engine: Generated optimal dispatch path for ${newRoute.truckId}`, 'success');
      addEvent(`Path collects ${newRoute.bins.length} critical bins across ${newRoute.estimatedDistance} km in ${newRoute.estimatedTime} min`, 'info');
    } else {
      addEvent('Unable to generate feasible route — all suitable EV vehicles dispatched', 'critical');
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
    addEvent(`Route Approved by Dispatcher: ${route.truckId} en route to ${route.bins.length} stops`, 'success');
  }, [route, addEvent]);

  const rejectRoute = useCallback(() => {
    if (!route) return;
    setTrucks(prev => prev.map(t =>
      t.id === route.truckId
        ? { ...t, status: 'idle' as const, assignedBins: [] }
        : t
    ));
    setRoute(null);
    setRouteApproved(false);
    addEvent(`Route assignment for ${route.truckId} rejected and returned to pool`, 'warning');
  }, [route, addEvent]);

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
    approveRoute,
    rejectRoute,
    activeScenario,
    scenario,
    changeScenario,
    activeNav,
    setActiveNav,
    addEvent,
    searchQuery,
    setSearchQuery,
  };
}
