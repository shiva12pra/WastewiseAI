// ==========================================
// WasteWiseAI — Overview View (Command Center)
// MAP-FIRST • DECISION-FOCUSED • CLEAN
// ==========================================

import { Play, Pause, Activity, Sparkles, Filter } from 'lucide-react';
import KpiCards from '../components/KpiCards';
import LiveMap from '../components/LiveMap';
import CriticalBinsPanel from '../components/CriticalBinsPanel';
import PredictionChart from '../components/PredictionChart';
import FleetPanel from '../components/FleetPanel';
import RouteOptimizationPanel from '../components/RouteOptimizationPanel';
import { Bin, Truck, RouteRecommendation, Scenario, ScenarioType, EventLog, KpiData } from '../types';
import { scenariosData } from '../data/scenarios';

interface OverviewViewProps {
  kpis: KpiData;
  bins: Bin[];
  trucks: Truck[];
  selectedBin: Bin | null;
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
  onDispatchBin?: (id: string) => void;
  route: RouteRecommendation | null;
  routeApproved: boolean;
  onGenerateRoute: () => void;
  onApproveRoute: () => void;
  onRejectRoute: () => void;
  activeScenario: ScenarioType;
  scenario: Scenario;
  onChangeScenario: (type: ScenarioType) => void;
  events: EventLog[];
  simulationActive?: boolean;
  onToggleSimulation?: () => void;
}

const scenarioPills: { type: ScenarioType; label: string; icon: string }[] = [
  { type: 'normal', label: 'Normal Day', icon: '☀️' },
  { type: 'festival', label: 'Festival / Surge', icon: '🎉' },
  { type: 'heavy-rain', label: 'Heavy Rain', icon: '🌧️' },
  { type: 'traffic', label: 'Traffic Congestion', icon: '🚗' },
  { type: 'truck-unavailable', label: 'Unit Failover', icon: '🚫' },
];

export default function OverviewView({
  kpis,
  bins,
  trucks,
  selectedBin,
  selectedBinId,
  onSelectBin,
  onDispatchBin,
  route,
  routeApproved,
  onGenerateRoute,
  onApproveRoute,
  onRejectRoute,
  activeScenario,
  scenario,
  onChangeScenario,
  simulationActive = true,
  onToggleSimulation,
}: OverviewViewProps) {
  return (
    <div className="overview-view map-first-layout">
      {/* 1. Compact Top KPI Cards Row */}
      <KpiCards kpis={kpis} />

      {/* Operations Bar: Live Simulation Status + Quick Scenario Switcher */}
      <div className="demo-notice-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '6px 12px',
        background: '#FFFFFF',
        border: '1px solid #DCE5DF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Live simulation pulse & pause toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="demo-notice-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: simulationActive ? '#176B3A' : '#64748B',
            color: '#FFFFFF',
            fontSize: '9px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            <Activity size={12} className={simulationActive ? 'animate-pulse text-white' : 'text-slate-200'} />
            {simulationActive ? 'LIVE TELEMETRY' : 'PAUSED'}
          </span>
          <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
            32 IoT Ultrasonic Sensors • {trucks.length} Operations Units
          </span>
          {onToggleSimulation && (
            <button
              onClick={onToggleSimulation}
              className="sim-toggle-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                fontSize: '10.5px',
                fontWeight: 600,
                borderRadius: '4px',
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
              }}
              title={simulationActive ? 'Pause simulation tick' : 'Resume simulation tick'}
            >
              {simulationActive ? <Pause size={10} /> : <Play size={10} />}
              {simulationActive ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>

        {/* Right: Quick Scenario Switcher — Allows judges to test scenarios without leaving the map */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', marginRight: '4px' }}>
            Operational Scenario:
          </span>
          {scenarioPills.map(s => (
            <button
              key={s.type}
              onClick={() => onChangeScenario(s.type)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: activeScenario === s.type ? 800 : 600,
                background: activeScenario === s.type ? '#176B3A' : '#F8FAF8',
                color: activeScenario === s.type ? '#FFFFFF' : '#475569',
                border: activeScenario === s.type ? '1px solid #176B3A' : '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2 & 3. LARGE Central Operational Map (68%) + Action Required Panel (32%) */}
      <div className="dashboard-grid-row map-critical-row" style={{ height: '530px', minHeight: '500px' }}>
        <LiveMap
          bins={bins}
          trucks={trucks}
          selectedBinId={selectedBinId}
          onSelectBin={onSelectBin}
          onDispatchBin={onDispatchBin}
          route={route}
          height="100%"
        />
        <CriticalBinsPanel
          bins={bins}
          selectedBinId={selectedBinId}
          onSelectBin={onSelectBin}
          onDispatchBin={onDispatchBin}
        />
      </div>

      {/* 4. Compact Bottom Row: Prediction, Route Recommendation & Fleet Status */}
      <div className="dashboard-grid-row panels-row-3 overview-bottom-row" style={{ minHeight: '260px' }}>
        <PredictionChart
          bin={selectedBin}
          fillRateMultiplier={scenario.fillRateMultiplier}
        />
        <RouteOptimizationPanel
          route={route}
          routeApproved={routeApproved}
          bins={bins}
          trucks={trucks}
          onGenerateRoute={onGenerateRoute}
          onApprove={onApproveRoute}
          onReject={onRejectRoute}
        />
        <FleetPanel trucks={trucks} />
      </div>
    </div>
  );
}
