// ==========================================
// WasteWiseAI — Environmental & Operational Impact View
// ==========================================

import { useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Zap,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { RouteRecommendation, Truck as TruckType, Scenario, Bin } from '../types';
import { calculateImpactComparison } from '../utils/routeOptimization';

interface ImpactViewProps {
  route: RouteRecommendation | null;
  trucks: TruckType[];
  scenario?: Scenario;
  bins?: Bin[];
}

export default function ImpactView({
  route,
  trucks,
  scenario = {
    type: 'normal',
    label: 'Normal Day',
    description: 'Baseline municipal operations',
    fillRateMultiplier: 1.0,
    wasteGenerationIncrease: 0,
  },
}: ImpactViewProps) {
  // Dynamically calculate simulated comparative metrics based on active route and scenario
  const { impactMetrics, chartData, summary } = useMemo(() => {
    return calculateImpactComparison(route, scenario, trucks);
  }, [route, scenario, trucks]);

  return (
    <div className="impact-view">
      {/* Simulation Notice Banner */}
      <div className="impact-simulation-banner">
        <div className="banner-left">
          <Info size={16} className="text-emerald-700" />
          <span className="banner-title">Simulated Comparison: Traditional Fixed Route vs WasteWiseAI</span>
          <span className="banner-desc">
            Comparative analysis recalculated dynamically based on current scenario ({scenario.label}) and route optimization state.
          </span>
        </div>
        <span className="simulation-tag">SIMULATED COMPARISON</span>
      </div>

      {/* Core Value Proposition Card: MONITOR -> PREDICT -> PRIORITIZE -> OPTIMIZE -> COLLECT */}
      <div className="core-value-chain-card">
        <div className="value-chain-header">
          <Sparkles size={16} className="text-emerald-700" />
          <span className="value-chain-title">THE WASTEWISEAI PARADIGM SHIFT</span>
        </div>
        <p className="value-chain-subtitle">
          Municipal waste collection transitions from rigid fixed schedules to intelligent demand-driven logistics:
        </p>

        <div className="value-chain-steps">
          <div className="chain-step">
            <div className="step-num">01</div>
            <div className="step-label">MONITOR</div>
            <div className="step-desc">IoT ultrasonic fill telemetry</div>
          </div>
          <div className="chain-arrow">→</div>

          <div className="chain-step">
            <div className="step-num">02</div>
            <div className="step-label">PREDICT</div>
            <div className="step-desc">Time-to-critical overflow modeling</div>
          </div>
          <div className="chain-arrow">→</div>

          <div className="chain-step highlight">
            <div className="step-num">03</div>
            <div className="step-label">PRIORITIZE</div>
            <div className="step-desc">Dynamic risk scoring matrix</div>
          </div>
          <div className="chain-arrow">→</div>

          <div className="chain-step">
            <div className="step-num">04</div>
            <div className="step-label">OPTIMIZE</div>
            <div className="step-desc">Energy-conscious route clustering</div>
          </div>
          <div className="chain-arrow">→</div>

          <div className="chain-step">
            <div className="step-num">05</div>
            <div className="step-label">COLLECT</div>
            <div className="step-desc">Targeted, demand-driven dispatch</div>
          </div>
        </div>

        <div className="value-outcomes-pills">
          <span className="outcome-pill">✓ Fewer overflowing bins</span>
          <span className="outcome-pill">✓ Zero unnecessary collection trips</span>
          <span className="outcome-pill">✓ High vehicle operational longevity</span>
          <span className="outcome-pill">✓ Better citizen satisfaction</span>
        </div>
      </div>

      {/* Top 4 Highlights Row — Dynamically Computed */}
      <div className="impact-kpi-row">
        <div className="impact-kpi-card">
          <span className="kpi-tag text-emerald-700">SERVICE ACCURACY</span>
          <div className="kpi-big-val text-emerald-800">
            {impactMetrics.find(m => m.metric.includes('Critical Bins'))?.optimized || '98.5%'}
          </div>
          <div className="kpi-label">Critical Bins Collected Before Overflow</div>
          <div className="kpi-comparison">
            vs {impactMetrics.find(m => m.metric.includes('Critical Bins'))?.fixed} with Fixed Route ({impactMetrics.find(m => m.metric.includes('Critical Bins'))?.improvement})
          </div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-blue-700">LOGISTIC REDUCTION</span>
          <div className="kpi-big-val text-blue-800">-{summary.tripsReductionPct}%</div>
          <div className="kpi-label">Fewer Unnecessary Collection Sweeps</div>
          <div className="kpi-comparison">
            {impactMetrics.find(m => m.metric.includes('Trips'))?.optimized} vs {impactMetrics.find(m => m.metric.includes('Trips'))?.fixed}
          </div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-emerald-700">FLEET EFFICIENCY</span>
          <div className="kpi-big-val text-emerald-800">
            {impactMetrics.find(m => m.metric.includes('Utilization'))?.optimized || '86%'}
          </div>
          <div className="kpi-label">Average Vehicle Payload Utilization</div>
          <div className="kpi-comparison">Avoids driving 2.4-ton trucks half-empty</div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-amber-700">EMISSIONS & DISTANCE</span>
          <div className="kpi-big-val text-amber-700">-{summary.distanceSavedPct}%</div>
          <div className="kpi-label">Simulated Distance & Energy Saved</div>
          <div className="kpi-comparison">Cuts ~{summary.co2SavedKg} kg CO2e emissions</div>
        </div>
      </div>

      {/* Comparative Chart & Fleet Optimization Section */}
      <div className="impact-analytics-grid">
        {/* Left: Recharts Bar Chart */}
        <div className="panel impact-chart-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <BarChart3 size={18} className="text-emerald-700" />
              <div>
                <h3 className="panel-title">Operational Performance (Simulated Comparison)</h3>
                <span className="panel-subtitle">Traditional Fixed Route vs WasteWiseAI Demand-Driven Dispatch</span>
              </div>
            </div>
          </div>

          <div className="impact-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCE5DF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={value => (
                    <span style={{ color: '#17221B', fontWeight: 600, fontSize: 12 }}>{value}</span>
                  )}
                />
                <Bar dataKey="Fixed" fill="#94A3B8" name="Traditional Fixed Route" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WasteWiseAI" fill="#176B3A" name="WasteWiseAI (Demand-Driven)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Fleet Energy & Route Efficiency Focus */}
        <div className="panel ev-focus-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <Zap size={18} className="text-emerald-700" />
              <h3 className="panel-title">Fleet Energy & Operational Optimization</h3>
            </div>
          </div>

          <p className="panel-subtitle">
            How demand-driven dispatching specifically amplifies municipal collection fleets:
          </p>

          <div className="ev-benefits-list">
            <div className="ev-benefit-item">
              <div className="benefit-icon">
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="benefit-content">
                <span className="benefit-title">Zero Midday Depot Interruptions</span>
                <p className="benefit-desc">
                  By cutting unnecessary travel by ~{summary.distanceSavedPct}%, collection vehicles complete full shifts without mid-day depot return delays.
                </p>
              </div>
            </div>

            <div className="ev-benefit-item">
              <div className="benefit-icon">
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="benefit-content">
                <span className="benefit-title">Payload-Aware Range Prediction</span>
                <p className="benefit-desc">
                  The routing engine accounts for vehicle weight increases as bins are loaded, maintaining safe return margins under all scenarios.
                </p>
              </div>
            </div>

            <div className="ev-benefit-item">
              <div className="benefit-icon">
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="benefit-content">
                <span className="benefit-title">Localized Stop Clustering</span>
                <p className="benefit-desc">
                  Stop sequences are clustered geographically, reducing stop-and-go energy loss during urban municipal pickups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Comparative Table */}
      <div className="panel impact-table-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <TrendingUp size={16} className="text-emerald-700" />
            <h3 className="panel-title">Comprehensive Operational Metric Registry (Simulated Comparison)</h3>
          </div>
          <span className="panel-count">7 Operational Dimensions</span>
        </div>

        <div className="impact-table-wrapper">
          <table className="impact-table">
            <thead>
              <tr>
                <th>Operational Metric</th>
                <th>Category</th>
                <th>Traditional Fixed Route</th>
                <th>WasteWiseAI (Demand-Driven)</th>
                <th>Simulated Improvement</th>
                <th>Operational Significance</th>
              </tr>
            </thead>
            <tbody>
              {impactMetrics.map(item => (
                <tr key={item.metric}>
                  <td className="font-bold text-dark">{item.metric}</td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td className="text-secondary font-mono">{item.fixed}</td>
                  <td className="font-bold text-dark font-mono">{item.optimized}</td>
                  <td>
                    <span className="improvement-badge positive">{item.improvement}</span>
                  </td>
                  <td className="text-secondary text-sm">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
