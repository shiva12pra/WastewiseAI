// ==========================================
// WasteWiseAI — AI Prediction Chart
// ==========================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Brain, Info } from 'lucide-react';
import { Bin } from '../types';
import { generatePredictionData } from '../utils/riskScoring';

interface PredictionChartProps {
  bin: Bin | null;
  fillRateMultiplier: number;
}

export default function PredictionChart({ bin, fillRateMultiplier }: PredictionChartProps) {
  if (!bin) {
    return (
      <div className="panel prediction-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <Brain size={16} className="panel-header-icon purple" />
            <h3 className="panel-title">AI Waste Prediction</h3>
          </div>
        </div>
        <div className="panel-empty">
          <p>Select a bin to view predictions</p>
        </div>
      </div>
    );
  }

  const data = generatePredictionData(bin, fillRateMultiplier);
  const crossingPoint = data.find(d => d.predicted >= bin.criticalThreshold && d.hour > 0);

  return (
    <div className="panel prediction-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <Brain size={16} className="panel-header-icon purple" />
          <h3 className="panel-title">AI Waste Prediction</h3>
        </div>
        <div className="prediction-confidence">
          <span className="confidence-label">Confidence</span>
          <span className="confidence-value">94%</span>
        </div>
      </div>
      <p className="panel-subtitle">
        Predicted fill level for <strong>{bin.id}</strong> — {bin.location}
      </p>

      <div className="prediction-chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#e2e8f0',
              }}
            />
            <ReferenceLine
              y={bin.criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="6 4"
              label={{ value: `Critical (${bin.criticalThreshold}%)`, fill: '#ef4444', fontSize: 10, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              fill="url(#fillGrad)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
            <Line
              type="monotone"
              dataKey="fill"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, fill: '#22c55e' }}
              activeDot={{ r: 4, fill: '#22c55e' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {crossingPoint && (
        <div className="prediction-alert">
          <AlertDot />
          <span>Predicted to cross critical threshold at <strong>{crossingPoint.label}</strong> ({crossingPoint.predicted}%)</span>
        </div>
      )}

      <div className="prediction-tag">
        <Info size={12} />
        <span>Prediction simulation — demo data</span>
      </div>
    </div>
  );
}

function AlertDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: '#ef4444', display: 'inline-block',
      marginRight: 6, flexShrink: 0,
    }} />
  );
}
