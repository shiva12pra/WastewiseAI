// ==========================================
// WasteWiseAI — Environmental & Operational Impact View
// ==========================================

import {
  TrendingUp,
  BarChart3,
  Leaf,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
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
import { RouteRecommendation, Truck as TruckType } from '../types';

interface ImpactViewProps {
  route: RouteRecommendation | null;
  trucks: TruckType[];
}

export default function ImpactView({ route, trucks }: ImpactViewProps) {
  // Simulated comparative metrics: Fixed Schedule vs WasteWiseAI
  const impactMetrics = [
    {
      metric: 'Total Distance Travelled',
      category: 'Operations',
      fixed: '142 km',
      optimized: '89 km',
      improvement: '-37.3%',
      isPositive: true,
      fixedNum: 142,
      optNum: 89,
      unit: 'km',
      notes: 'Eliminates trips to half-empty residential bins',
    },
    {
      metric: 'Daily Collection Trips',
      category: 'Operations',
      fixed: '8 trips',
      optimized: '4 trips',
      improvement: '-50.0%',
      isPositive: true,
      fixedNum: 8,
      optNum: 4,
      unit: 'trips',
      notes: 'Demand-driven consolidation into full payloads',
    },
    {
      metric: 'Critical Bins Served Pre-Overflow',
      category: 'Service Level',
      fixed: '64.0%',
      optimized: '98.5%',
      improvement: '+34.5%',
      isPositive: true,
      fixedNum: 64,
      optNum: 98.5,
      unit: '%',
      notes: 'Predictive alerts dispatch before citizen complaints',
    },
    {
      metric: 'Fleet Utilization Rate',
      category: 'Fleet',
      fixed: '48.0%',
      optimized: '86.0%',
      improvement: '+38.0%',
      isPositive: true,
      fixedNum: 48,
      optNum: 86,
      unit: '%',
      notes: 'Payload-to-capacity alignment prevents empty runs',
    },
    {
      metric: 'Total Collection Hours',
      category: 'Operations',
      fixed: '6.4 hrs',
      optimized: '4.1 hrs',
      improvement: '-35.9%',
      isPositive: true,
      fixedNum: 6.4,
      optNum: 4.1,
      unit: 'hours',
      notes: 'Optimized stop sequencing reduces travel lag',
    },
    {
      metric: 'Estimated Energy Consumption',
      category: 'Energy (Secondary)',
      fixed: '114 kWh eq',
      optimized: '72 kWh eq',
      improvement: '-36.8%',
      isPositive: true,
      fixedNum: 114,
      optNum: 72,
      unit: 'kWh eq',
      notes: 'Preserves vehicle operational range across full shifts',
    },
    {
      metric: 'Estimated Scope 1 Direct CO2',
      category: 'Emissions (Secondary)',
      fixed: '42.6 kg CO2e',
      optimized: '18.2 kg CO2e',
      improvement: '-57.3%',
      isPositive: true,
      fixedNum: 42.6,
      optNum: 18.2,
      unit: 'kg CO2e',
      notes: 'Combined priority routing and reduced total distance',
    },
  ];

  // Bar chart dataset for primary operational comparison
  const chartData = [
    { name: 'Distance (km)', Fixed: 142, WasteWiseAI: 89 },
    { name: 'Trips (count × 10)', Fixed: 80, WasteWiseAI: 40 },
    { name: 'Served Pre-Overflow (%)', Fixed: 64, WasteWiseAI: 98.5 },
    { name: 'Fleet Utilization (%)', Fixed: 48, WasteWiseAI: 86 },
    { name: 'Collection Time (hrs × 10)', Fixed: 64, WasteWiseAI: 41 },
  ];

  return (
    <div className="impact-view">
      {/* Simulation Notice Banner */}
      <div className="impact-simulation-banner">
        <div className="banner-left">
          <Info size={16} className="text-emerald-700" />
          <span className="banner-title">Simulated & Estimated Operational Impact Metrics</span>
          <span className="banner-desc">
            Comparative analysis based on 30-day municipal simulation data. Real-world savings depend on local traffic, seasonal variations, and terrain.
          </span>
        </div>
        <span className="simulation-tag">SIMULATED METRICS</span>
      </div>

      {/* Core Value Proposition Card: MONITOR -> PREDICT -> PRIORITIZE -> OPTIMIZE -> COLLECT */}
      <div className="core-value-chain-card">
        <div className="value-chain-header">
          <Sparkles size={16} className="text-emerald-700" />
          <span className="value-chain-title">THE WASTEWAISEAI PARADIGM SHIFT</span>
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
            <div className="step-desc">Targeted, zero-waste dispatch</div>
          </div>
        </div>

        <div className="value-outcomes-pills">
          <span className="outcome-pill">✓ Fewer overflowing bins</span>
          <span className="outcome-pill">✓ Zero unnecessary collection trips</span>
          <span className="outcome-pill">✓ High vehicle operational longevity</span>
          <span className="outcome-pill">✓ Better citizen satisfaction</span>
        </div>
      </div>

      {/* Top 4 Highlights Row */}
      <div className="impact-kpi-row">
        <div className="impact-kpi-card">
          <span className="kpi-tag text-emerald-700">SERVICE ACCURACY</span>
          <div className="kpi-big-val text-emerald-800">98.5%</div>
          <div className="kpi-label">Critical Bins Collected Before Overflow</div>
          <div className="kpi-comparison">vs 64.0% with Fixed Schedule (+34.5%)</div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-blue-700">LOGISTIC REDUCTION</span>
          <div className="kpi-big-val text-blue-800">-50%</div>
          <div className="kpi-label">Fewer Unnecessary Truck Trips</div>
          <div className="kpi-comparison">4 targeted runs vs 8 scheduled sweeps</div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-emerald-700">FLEET EFFICIENCY</span>
          <div className="kpi-big-val text-emerald-800">86%</div>
          <div className="kpi-label">Average Vehicle Payload Utilization</div>
          <div className="kpi-comparison">Avoids driving 2.4-ton trucks half-empty</div>
        </div>

        <div className="impact-kpi-card">
          <span className="kpi-tag text-amber-700">SECONDARY IMPACT</span>
          <div className="kpi-big-val text-amber-700">-37%</div>
          <div className="kpi-label">Simulated Distance & Energy Saved</div>
          <div className="kpi-comparison">Preserves fleet energy & cuts ~24 kg CO2e</div>
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
                <h3 className="panel-title">Operational Performance Comparison (Simulated)</h3>
                <span className="panel-subtitle">Traditional Fixed Schedule vs WasteWiseAI Demand-Driven Dispatch</span>
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

        {/* Right: Fleet Energy Optimization Focus */}
        <div className="panel ev-focus-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <Zap size={18} className="text-emerald-700" />
              <h3 className="panel-title">Fleet Energy & Range Optimization</h3>
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
                  By cutting unnecessary travel by 37%, vehicles complete full daily shifts without depot return delays.
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
                  The routing engine accounts for vehicle weight increases as bins are loaded, maintaining safe return margins.
                </p>
              </div>
            </div>

            <div className="ev-benefit-item">
              <div className="benefit-icon">
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="benefit-content">
                <span className="benefit-title">Regenerative Kinetic Energy Maximization</span>
                <p className="benefit-desc">
                  Stop sequences are clustered in localized zones, optimizing kinetic energy capture during low-speed municipal pickups.
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
            <h3 className="panel-title">Comprehensive Operational Metric Registry (Simulated)</h3>
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
