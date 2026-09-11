// ==========================================
// WasteWiseAI — Main Application Shell
// ==========================================

import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewView from './views/OverviewView';
import LiveOperationsView from './views/LiveOperationsView';
import BinPredictionsView from './views/BinPredictionsView';
import RouteOptimizationView from './views/RouteOptimizationView';
import FleetView from './views/FleetView';
import ScenariosView from './views/ScenariosView';
import ImpactView from './views/ImpactView';

export default function App() {
  const state = useAppState();

  const renderActiveView = () => {
    switch (state.activeNav) {
      case 'overview':
        return (
          <OverviewView
            kpis={state.kpis}
            bins={state.bins}
            trucks={state.trucks}
            selectedBin={state.selectedBin}
            selectedBinId={state.selectedBinId}
            onSelectBin={state.selectBin}
            route={state.route}
            routeApproved={state.routeApproved}
            onGenerateRoute={state.generateRoute}
            onApproveRoute={state.approveRoute}
            onRejectRoute={state.rejectRoute}
            activeScenario={state.activeScenario}
            scenario={state.scenario}
            onChangeScenario={state.changeScenario}
            events={state.events}
          />
        );

      case 'live-ops':
        return (
          <LiveOperationsView
            bins={state.bins}
            trucks={state.trucks}
            selectedBinId={state.selectedBinId}
            selectedBin={state.selectedBin}
            onSelectBin={state.selectBin}
            route={state.route}
            events={state.events}
            onGenerateRoute={state.generateRoute}
            onApproveRoute={state.approveRoute}
            routeApproved={state.routeApproved}
          />
        );

      case 'predictions':
        return (
          <BinPredictionsView
            bins={state.bins}
            selectedBin={state.selectedBin}
            onSelectBin={state.selectBin}
            fillRateMultiplier={state.scenario.fillRateMultiplier}
          />
        );

      case 'routes':
        return (
          <RouteOptimizationView
            route={state.route}
            routeApproved={state.routeApproved}
            bins={state.bins}
            trucks={state.trucks}
            onGenerateRoute={state.generateRoute}
            onApprove={state.approveRoute}
            onReject={state.rejectRoute}
            selectedBinId={state.selectedBinId}
            onSelectBin={state.selectBin}
          />
        );

      case 'fleet':
        return (
          <FleetView trucks={state.trucks} />
        );

      case 'scenarios':
        return (
          <ScenariosView
            activeScenario={state.activeScenario}
            scenario={state.scenario}
            onChangeScenario={state.changeScenario}
            bins={state.bins}
            trucks={state.trucks}
            onNavigate={state.setActiveNav}
          />
        );

      case 'impact':
        return (
          <ImpactView
            route={state.route}
            trucks={state.trucks}
          />
        );

      default:
        return (
          <OverviewView
            kpis={state.kpis}
            bins={state.bins}
            trucks={state.trucks}
            selectedBin={state.selectedBin}
            selectedBinId={state.selectedBinId}
            onSelectBin={state.selectBin}
            route={state.route}
            routeApproved={state.routeApproved}
            onGenerateRoute={state.generateRoute}
            onApproveRoute={state.approveRoute}
            onRejectRoute={state.rejectRoute}
            activeScenario={state.activeScenario}
            scenario={state.scenario}
            onChangeScenario={state.changeScenario}
            events={state.events}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={state.activeNav}
        setActiveNav={state.setActiveNav}
        criticalCount={state.kpis.criticalBins}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          activeNav={state.activeNav}
          activeScenario={state.activeScenario}
          bins={state.bins}
          trucks={state.trucks}
          onSelectBin={state.selectBin}
          onNavigate={state.setActiveNav}
        />

        <div className="view-scroll-container">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
