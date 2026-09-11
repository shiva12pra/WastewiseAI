// ==========================================
// WasteWiseAI — Scenarios Simulator View
// ==========================================

import {
  FlaskConical,
  Sun,
  PartyPopper,
  CloudRain,
  Car,
  Ban,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { ScenarioType, Scenario, Bin, Truck } from '../types';
import { scenariosData } from '../data/scenarios';

interface ScenariosViewProps {
  activeScenario: ScenarioType;
  scenario: Scenario;
  onChangeScenario: (type: ScenarioType) => void;
  bins: Bin[];
  trucks: Truck[];
  onNavigate: (nav: string) => void;
}

const scenarioDetails: Record<
  ScenarioType,
  {
    icon: any;
    color: string;
    badge: string;
    impactSummary: string;
    consequences: string[];
    dispatchImpact: string;
  }
> = {
  normal: {
    icon: Sun,
    color: '#16A34A',
    badge: 'Baseline Mode',
    impactSummary: 'Standard municipal conditions. Waste accumulates at typical baseline rates (+1.0x).',
    consequences: [
      'Normal 8-hour shift collection intervals',
      'Average of 4-6 critical bins at any time',
      'Municipal fleet operates within nominal energy discharge envelopes',
      'Optimal traffic flow with predictable pickup delays',
    ],
    dispatchImpact: 'Default route optimization algorithm balances stops across available fleet.',
  },
  festival: {
    icon: PartyPopper,
    color: '#F59E0B',
    badge: '+45% Waste Influx',
    impactSummary: 'Major cultural festival in central commercial districts & event squares. Influx spikes to 1.85x.',
    consequences: [
      'Commercial bins reach 90% threshold in under 3.5 hours',
      'High-density zones (Market St, Plaza, Brigade Rd) require immediate double-shift pickup',
      'Critical bins count surges by +80%',
      'Pre-emptive routing automatically prioritizes commercial hubs before overflows occur',
    ],
    dispatchImpact: 'System prioritizes maximum load collection units to high-throughput sectors.',
  },
  'heavy-rain': {
    icon: CloudRain,
    color: '#0284C7',
    badge: '+20% Weight Factor',
    impactSummary: 'Severe monsoon downpour. Organic waste absorbs water weight and street transit speeds drop by 30%.',
    consequences: [
      'Waste mass density increases; bins reach weight capacity before volume limit',
      'Low-lying bins near Lake View and Residency Rd risk street flooding',
      'Truck transit speeds reduced from 35 km/h to 22 km/h',
      'Safety margins for vehicle traction on wet roadways enforced',
    ],
    dispatchImpact: 'Routes are rerouted along elevated arterial roads; stop count per run reduced by 15%.',
  },
  traffic: {
    icon: Car,
    color: '#D97706',
    badge: '+35% Transit Delay',
    impactSummary: 'Severe congestion along central corridors due to peak rush-hour construction closures.',
    consequences: [
      'Average transit time between stops increases by +35%',
      'Stop-and-go driving increases vehicle auxiliary energy draw by ~14%',
      'Time-to-overflow deadlines become more urgent due to transit lag',
      'Cluster routing tightens to minimize cross-town travel',
    ],
    dispatchImpact: 'Dispatcher recommends localized micro-routes rather than cross-district sweeps.',
  },
  'truck-unavailable': {
    icon: Ban,
    color: '#DC2626',
    badge: 'Unit EV-02 In Depot',
    impactSummary: 'Primary heavy-duty vehicle EV-02 undergoes scheduled mechanical depot servicing.',
    consequences: [
      'Fleet collection capacity drops by 12.5%',
      'Unassigned routes originally slated for EV-02 must be dynamically absorbed',
      'Alternate fleet units automatically assigned redistributed stop queues',
      'High-risk bins served with zero disruption to civilian collection schedule',
    ],
    dispatchImpact: 'Automated failover algorithm recalculates stops for alternate units without human re-entry.',
  },
};

export default function ScenariosView({
  activeScenario,
  scenario,
  onChangeScenario,
  bins,
  trucks,
  onNavigate,
}: ScenariosViewProps) {
  const currentDetail = scenarioDetails[activeScenario];
  const criticalCount = bins.filter(b => b.priority === 'critical' || b.priority === 'high').length;

  return (
    <div className="scenarios-view">
      {/* Header Banner */}
      <div className="scenarios-banner">
        <div className="banner-left">
          <FlaskConical size={20} className="text-emerald-700" />
          <div>
            <h2 className="banner-title">Operational Scenario Simulator & Stress Engine</h2>
            <p className="banner-sub">
              Simulate municipal contingencies, weather disruptions, and fleet failures to test WasteWiseAI’s dynamic response.
            </p>
          </div>
        </div>

        {activeScenario !== 'normal' && (
          <button className="btn-reset-scenario" onClick={() => onChangeScenario('normal')}>
            <RotateCcw size={14} /> Reset to Normal Baseline
          </button>
        )}
      </div>

      {/* 5 Scenario Selection Cards */}
      <div className="scenario-cards-grid">
        {scenariosData.map(sc => {
          const detail = scenarioDetails[sc.type];
          const Icon = detail.icon;
          const isActive = activeScenario === sc.type;

          return (
            <div
              key={sc.type}
              className={`scenario-card ${isActive ? 'active' : ''}`}
              onClick={() => onChangeScenario(sc.type)}
            >
              <div className="card-top-row">
                <div className="scenario-icon-box" style={{ color: detail.color }}>
                  <Icon size={20} />
                </div>
                <span className={`scenario-badge-pill ${isActive ? 'active-badge' : ''}`}>
                  {detail.badge}
                </span>
              </div>

              <h3 className="scenario-name">{sc.label}</h3>
              <p className="scenario-desc">{sc.description}</p>

              <div className="scenario-card-footer">
                <span className="multiplier-tag">
                  {sc.wasteGenerationIncrease > 0
                    ? `+${sc.wasteGenerationIncrease}% Influx`
                    : sc.type === 'normal'
                    ? 'Baseline'
                    : 'System Failover'}
                </span>
                <span className={`scenario-status-indicator ${isActive ? 'active' : ''}`}>
                  {isActive ? 'ACTIVE' : 'TEST'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Impact Breakdown Dashboard */}
      <div className="panel active-scenario-detail-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <AlertTriangle size={18} style={{ color: currentDetail.color }} />
            <div>
              <h3 className="panel-title">
                Active Simulation Impact: <span style={{ color: currentDetail.color }}>{scenario.label}</span>
              </h3>
              <span className="panel-subtitle">{currentDetail.impactSummary}</span>
            </div>
          </div>
          <span className="live-simulation-tag">DATA DYNAMICALLY RECALCULATED</span>
        </div>

        {/* Real-time Impact Metrics Row */}
        <div className="scenario-impact-metrics-grid">
          <div className="impact-metric-box">
            <span className="metric-title">Critical Bins At Risk</span>
            <span className={`metric-num ${criticalCount >= 8 ? 'text-red-600' : 'text-amber-600'}`}>
              {criticalCount} Bins
            </span>
            <span className="metric-delta">
              {activeScenario === 'festival' ? '+80% over baseline' : 'Currently prioritized'}
            </span>
          </div>

          <div className="impact-metric-box">
            <span className="metric-title">City Waste Influx</span>
            <span className="metric-num text-emerald-800">
              +{scenario.wasteGenerationIncrease}%
            </span>
            <span className="metric-delta">Relative to 42.4 ton daily normal</span>
          </div>

          <div className="impact-metric-box">
            <span className="metric-title">Active Fleet Required</span>
            <span className="metric-num text-blue-700">
              {activeScenario === 'festival' ? '6 Trucks' : '4 Trucks'}
            </span>
            <span className="metric-delta">Demand-driven dispatching</span>
          </div>

          <div className="impact-metric-box">
            <span className="metric-title">Fleet Availability</span>
            <span className={`metric-num ${activeScenario === 'truck-unavailable' ? 'text-red-600' : 'text-emerald-700'}`}>
              {activeScenario === 'truck-unavailable' ? '11 / 12 (Unit EV-02 in Depot)' : '12 / 12 Units'}
            </span>
            <span className="metric-delta">
              {activeScenario === 'truck-unavailable' ? 'Failover absorbed' : 'Full capacity available'}
            </span>
          </div>
        </div>

        {/* Operational Consequences & Algorithm Response */}
        <div className="scenario-consequences-grid">
          <div className="consequences-col">
            <h4 className="subpanel-title">Real-Time Operational Consequences</h4>
            <ul className="consequences-list">
              {currentDetail.consequences.map((c, i) => (
                <li key={i} className="consequence-item">
                  <span className="bullet-dot" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="algorithm-col">
            <h4 className="subpanel-title">WasteWiseAI Adaptive Response</h4>
            <div className="algorithm-card">
              <div className="algo-header">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span className="algo-title">Dynamic Dispatcher Adaptation</span>
              </div>
              <p className="algo-body">{currentDetail.dispatchImpact}</p>
              <div className="algo-actions">
                <button
                  className="btn-algo-action"
                  onClick={() => onNavigate('routes')}
                >
                  Generate Route for {scenario.label} <ArrowRight size={14} />
                </button>
                <button
                  className="btn-algo-secondary"
                  onClick={() => onNavigate('live-ops')}
                >
                  View Affected Bins on Map <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
