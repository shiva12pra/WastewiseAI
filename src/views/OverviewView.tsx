// ==========================================
// WasteWiseAI — Overview View (Command Center)
// ==========================================

import KpiCards from '../components/KpiCards';
import LiveMap from '../components/LiveMap';
import CriticalBinsPanel from '../components/CriticalBinsPanel';
import PredictionChart from '../components/PredictionChart';
import BinDetailPanel from '../components/BinDetailPanel';
import FleetPanel from '../components/FleetPanel';
import RouteOptimizationPanel from '../components/RouteOptimizationPanel';
import ScenarioSimulator from '../components/ScenarioSimulator';
import ComparisonPanel from '../components/ComparisonPanel';
import EventFeed from '../components/EventFeed';
import { Bin, Truck, RouteRecommendation, Scenario, ScenarioType, EventLog, KpiData } from '../types';

interface OverviewViewProps {
  kpis: KpiData;
  bins: Bin[];
  trucks: Truck[];
  selectedBin: Bin | null;
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
  route: RouteRecommendation | null;
  routeApproved: boolean;
  onGenerateRoute: () => void;
  onApproveRoute: () => void;
  onRejectRoute: () => void;
  activeScenario: ScenarioType;
  scenario: Scenario;
  onChangeScenario: (type: ScenarioType) => void;
  events: EventLog[];
}

export default function OverviewView({
  kpis,
  bins,
  trucks,
  selectedBin,
  selectedBinId,
  onSelectBin,
  route,
  routeApproved,
  onGenerateRoute,
  onApproveRoute,
  onRejectRoute,
  activeScenario,
  scenario,
  onChangeScenario,
  events,
}: OverviewViewProps) {
  return (
    <div className="overview-view">
      {/* Top KPI Cards Row */}
      <KpiCards kpis={kpis} />

      {/* Demo Simulation Notice Banner */}
      <div className="demo-notice-bar">
        <span className="demo-notice-badge">DEMO SIMULATION</span>
        <span className="demo-notice-text">
          Telemetry stream synchronized across 32 smart ultrasonic sensors & 12 municipal collection trucks.
        </span>
      </div>

      {/* Row 1: Central Operations Map & Critical Priority Bins */}
      <div className="dashboard-grid-row map-critical-row">
        <LiveMap
          bins={bins}
          trucks={trucks}
          selectedBinId={selectedBinId}
          onSelectBin={onSelectBin}
          route={route}
          height="380px"
        />
        <CriticalBinsPanel
          bins={bins}
          selectedBinId={selectedBinId}
          onSelectBin={onSelectBin}
        />
      </div>

      {/* Row 2: AI Prediction Curve & Selected Bin Detail */}
      <div className="dashboard-grid-row panels-row-2">
        <PredictionChart
          bin={selectedBin}
          fillRateMultiplier={scenario.fillRateMultiplier}
        />
        <BinDetailPanel
          bin={selectedBin}
          fillRateMultiplier={scenario.fillRateMultiplier}
        />
      </div>

      {/* Row 3: Route Optimization & Fleet Status */}
      <div className="dashboard-grid-row panels-row-2">
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

      {/* Row 4: Scenario Stress Testing, Comparison & Live Event Feed */}
      <div className="dashboard-grid-row panels-row-3">
        <ScenarioSimulator
          activeScenario={activeScenario}
          scenario={scenario}
          onChange={onChangeScenario}
        />
        <ComparisonPanel route={route} trucks={trucks} />
        <EventFeed events={events} />
      </div>
    </div>
  );
}
