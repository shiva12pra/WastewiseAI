// ==========================================
// WasteWiseAI — Bin Predictions View
// ==========================================

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  BarChart2,
  Calendar,
  Sparkles,
  Search,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Bin } from '../types';
import { generatePredictionData, getTimeToThreshold } from '../utils/riskScoring';

interface BinPredictionsViewProps {
  bins: Bin[];
  selectedBin: Bin | null;
  onSelectBin: (id: string) => void;
  fillRateMultiplier: number;
}

export default function BinPredictionsView({
  bins,
  selectedBin,
  onSelectBin,
  fillRateMultiplier,
}: BinPredictionsViewProps) {
  const activeBin = selectedBin || bins[0];
  const data = generatePredictionData(activeBin, fillRateMultiplier);
  const eta = getTimeToThreshold(activeBin, fillRateMultiplier);

  // Top 8 bins approaching threshold
  const topCriticalForecasts = [...bins]
    .sort((a, b) => {
      const etaA = getTimeToThreshold(a, fillRateMultiplier);
      const etaB = getTimeToThreshold(b, fillRateMultiplier);
      return etaA - etaB;
    })
    .slice(0, 8);

  return (
    <div className="predictions-view">
      {/* Simulation Disclaimer Banner */}
      <div className="prediction-disclaimer-banner">
        <div className="banner-left">
          <Sparkles size={16} className="text-emerald-700" />
          <span className="banner-title">Prediction Simulation Model</span>
          <span className="banner-desc">
            Time-series multi-factor simulation based on ultrasonic telemetry, zone schedules, and weather adjustments.
          </span>
        </div>
        <span className="simulation-tag">SIMULATION DEMO</span>
      </div>

      {/* Top Model Performance Metrics */}
      <div className="prediction-kpi-row">
        <div className="pred-kpi-card">
          <div className="pred-kpi-header">
            <span className="pred-kpi-title">Model Confidence</span>
            <span className="pred-kpi-badge good">94.6%</span>
          </div>
          <div className="pred-kpi-val">High Precision</div>
          <div className="pred-kpi-sub">Mean Absolute Error: ±3.2%</div>
        </div>

        <div className="pred-kpi-card">
          <div className="pred-kpi-header">
            <span className="pred-kpi-title">Bins at Critical Risk (&lt;6h)</span>
            <span className="pred-kpi-badge alert">{bins.filter(b => getTimeToThreshold(b) <= 6).length} Bins</span>
          </div>
          <div className="pred-kpi-val text-red-600">Urgent Dispatch</div>
          <div className="pred-kpi-sub">Requires pre-overflow collection</div>
        </div>

        <div className="pred-kpi-card">
          <div className="pred-kpi-header">
            <span className="pred-kpi-title">City Avg Fill Rate</span>
            <span className="pred-kpi-badge neutral">+{ (1.8 * fillRateMultiplier).toFixed(1) }%/hr</span>
          </div>
          <div className="pred-kpi-val">Standard Growth</div>
          <div className="pred-kpi-sub">Normal daytime municipal rhythm</div>
        </div>

        <div className="pred-kpi-card">
          <div className="pred-kpi-header">
            <span className="pred-kpi-title">Overflow Prevention</span>
            <span className="pred-kpi-badge good">98.4%</span>
          </div>
          <div className="pred-kpi-val text-emerald-700">Protected</div>
          <div className="pred-kpi-sub">Target: &gt;95% service level agreement</div>
        </div>
      </div>

      {/* Main Analytics Layout: Chart on Left, Risk Breakdown on Right */}
      <div className="prediction-analytics-grid">
        {/* Left: Large Chart */}
        <div className="panel prediction-main-chart-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <Brain size={18} className="text-emerald-700" />
              <div>
                <h3 className="panel-title">
                  Fill Level Forecast: <span className="text-emerald-700">{activeBin.id}</span>
                </h3>
                <span className="panel-subtitle">
                  {activeBin.location} • {activeBin.zoneType} sector • Current Fill: <strong>{activeBin.fillLevel}%</strong>
                </span>
              </div>
            </div>

            {/* Bin Switcher Dropdown */}
            <div className="bin-switcher">
              <label className="text-xs text-secondary mr-2">Select Bin:</label>
              <select
                className="bin-select-input"
                value={activeBin.id}
                onChange={e => onSelectBin(e.target.value)}
              >
                {bins.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.location} ({b.fillLevel}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recharts Forecast Curve */}
          <div className="prediction-chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="forestGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#176B3A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#176B3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 105]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      return (
                        <div className="prediction-custom-tooltip">
                          <div className="tooltip-time">{p.label}</div>
                          <div className="tooltip-row">
                            <span>Predicted Fill:</span>
                            <strong>{p.predicted}%</strong>
                          </div>
                          <div className="tooltip-row">
                            <span>Critical Threshold:</span>
                            <strong className="text-red-600">{activeBin.criticalThreshold}%</strong>
                          </div>
                          {p.predicted >= activeBin.criticalThreshold && (
                            <div className="tooltip-warning">⚠ Overflow Risk Zone</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={activeBin.criticalThreshold}
                  stroke="#DC2626"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Critical Alert (${activeBin.criticalThreshold}%)`,
                    fill: '#DC2626',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  fill="url(#forestGreenGrad)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#176B3A"
                  strokeWidth={3}
                  dot={{ fill: '#176B3A', r: 3 }}
                  activeDot={{ r: 6, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="prediction-chart-legend">
            <span className="legend-entry">
              <span className="legend-entry-line" style={{ background: '#176B3A' }} />
              Simulated Forecast Curve
            </span>
            <span className="legend-entry">
              <span className="legend-entry-dash" style={{ borderColor: '#DC2626' }} />
              Critical Overflow Threshold (90%)
            </span>
            <span className="legend-entry">
              <Clock size={13} className="text-secondary" />
              ETA until Overflow: <strong className="text-dark ml-1">{eta > 0 ? `${eta} hours` : 'Already Critical'}</strong>
            </span>
          </div>
        </div>

        {/* Right: Multi-Factor Risk Score Breakdown */}
        <div className="panel prediction-breakdown-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <BarChart2 size={18} className="text-emerald-700" />
              <h3 className="panel-title">Risk Scoring Matrix</h3>
            </div>
            <span className="risk-score-pill">Score: {activeBin.riskScore}/100</span>
          </div>

          <p className="panel-subtitle">
            Weighted algorithmic breakdown of risk factors determining dispatch urgency:
          </p>

          <div className="risk-factors-list">
            <div className="risk-factor-item">
              <div className="factor-header">
                <span className="factor-title">1. Current Fill Level (40% Weight)</span>
                <span className="factor-value">{activeBin.fillLevel}%</span>
              </div>
              <div className="factor-bar">
                <div
                  className="factor-bar-fill"
                  style={{ width: `${activeBin.fillLevel}%`, background: '#176B3A' }}
                />
              </div>
              <span className="factor-note">Ultrasonic sensor reading calibrated to volume</span>
            </div>

            <div className="risk-factor-item">
              <div className="factor-header">
                <span className="factor-title">2. Influx Rate Delta (30% Weight)</span>
                <span className="factor-value">+{activeBin.fillRate}%/hr</span>
              </div>
              <div className="factor-bar">
                <div
                  className="factor-bar-fill"
                  style={{ width: `${Math.min(activeBin.fillRate * 20, 100)}%`, background: '#F59E0B' }}
                />
              </div>
              <span className="factor-note">Velocity of waste accumulation over last 4 hours</span>
            </div>

            <div className="risk-factor-item">
              <div className="factor-header">
                <span className="factor-title">3. Time to Overflow (20% Weight)</span>
                <span className="factor-value">{eta > 0 ? `${eta}h` : 'Immediate'}</span>
              </div>
              <div className="factor-bar">
                <div
                  className="factor-bar-fill"
                  style={{ width: `${Math.max(100 - eta * 10, 20)}%`, background: '#DC2626' }}
                />
              </div>
              <span className="factor-note">Dynamic deadline before spillover occurrence</span>
            </div>

            <div className="risk-factor-item">
              <div className="factor-header">
                <span className="factor-title">4. Zone Priority (10% Weight)</span>
                <span className="factor-value capitalize">{activeBin.zoneType} (Level {activeBin.areaPriority})</span>
              </div>
              <div className="factor-bar">
                <div
                  className="factor-bar-fill"
                  style={{ width: `${activeBin.areaPriority * 20}%`, background: '#0284C7' }}
                />
              </div>
              <span className="factor-note">Civic priority weighting for commercial and medical zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Top Predicted Critical Bins Table */}
      <div className="panel prediction-table-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="panel-title">Top Predicted Critical Bins Requiring Pre-emptive Collection</h3>
          </div>
          <span className="panel-count">{topCriticalForecasts.length} Critical Targets</span>
        </div>

        <div className="prediction-table-wrapper">
          <table className="prediction-table">
            <thead>
              <tr>
                <th>Bin ID</th>
                <th>Location & Zone</th>
                <th>Current Fill</th>
                <th>Rate / Hr</th>
                <th>6h Forecast</th>
                <th>12h Forecast</th>
                <th>ETA Overflow</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topCriticalForecasts.map(bin => {
                const binEta = getTimeToThreshold(bin, fillRateMultiplier);
                return (
                  <tr
                    key={bin.id}
                    className={activeBin.id === bin.id ? 'active-row' : ''}
                    onClick={() => onSelectBin(bin.id)}
                  >
                    <td className="font-bold text-dark">{bin.id}</td>
                    <td>
                      <div className="location-cell">
                        <span>{bin.location}</span>
                        <span className="zone-tag capitalize">{bin.zoneType}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-fill-bar">
                        <div
                          className="table-fill-bar-fill"
                          style={{
                            width: `${bin.fillLevel}%`,
                            background:
                              bin.fillLevel >= 85
                                ? 'var(--accent-red)'
                                : bin.fillLevel >= 70
                                ? 'var(--accent-amber)'
                                : 'var(--accent-emerald)',
                          }}
                        />
                        <span className="table-fill-val">{bin.fillLevel}%</span>
                      </div>
                    </td>
                    <td className="font-semibold text-emerald-800">+{bin.fillRate}%/h</td>
                    <td>{bin.predictedFill6h}%</td>
                    <td>{bin.predictedFill12h}%</td>
                    <td>
                      <span className={`eta-badge ${binEta <= 4 ? 'urgent' : ''}`}>
                        {binEta > 0 ? `${binEta}h` : 'Overflowing'}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${bin.priority}`}>
                        {bin.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-table-inspect"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectBin(bin.id);
                        }}
                      >
                        Inspect Curve <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
