// ==========================================
// WasteWiseAI — Before vs After Comparison
// ==========================================

import { BarChart3, Info } from 'lucide-react';
import { RouteRecommendation, Truck } from '../types';
import { getComparisonMetrics } from '../utils/routeOptimization';

interface ComparisonPanelProps {
  route: RouteRecommendation | null;
  trucks: Truck[];
}

export default function ComparisonPanel({ route, trucks }: ComparisonPanelProps) {
  if (!route) {
    return (
      <div className="panel comparison-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <BarChart3 size={16} className="panel-header-icon emerald" />
            <h3 className="panel-title">Fixed Route vs WasteWiseAI</h3>
          </div>
        </div>
        <div className="panel-empty">
          <p>Generate a route to see comparison</p>
        </div>
      </div>
    );
  }

  const truck = trucks.find(t => t.id === route.truckId);
  if (!truck) return null;
  const metrics = getComparisonMetrics(route, truck);

  return (
    <div className="panel comparison-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <BarChart3 size={16} className="panel-header-icon emerald" />
          <h3 className="panel-title">Fixed Route vs WasteWiseAI</h3>
        </div>
      </div>

      <div className="comparison-table">
        <div className="comparison-header-row">
          <span className="comparison-metric-header">Metric</span>
          <span className="comparison-fixed-header">Fixed Route</span>
          <span className="comparison-opt-header">WasteWiseAI</span>
          <span className="comparison-imp-header">Improvement</span>
        </div>
        {metrics.map(m => (
          <div key={m.metric} className="comparison-row">
            <span className="comparison-metric">{m.metric}</span>
            <span className="comparison-fixed">{m.fixed}</span>
            <span className="comparison-optimized">{m.optimized}</span>
            <span className="comparison-improvement">{m.improvement}</span>
          </div>
        ))}
      </div>

      <div className="prediction-tag" style={{ marginTop: '10px' }}>
        <Info size={12} />
        <span>Simulated improvement — demonstration data</span>
      </div>
    </div>
  );
}
