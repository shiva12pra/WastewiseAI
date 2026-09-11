// ==========================================
// WasteWiseAI — AI Prediction Chart
// ==========================================

import { XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart, Line } from 'recharts';
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
            <Brain size={16} className="panel-header-icon text-emerald-700" />
            <h3 className="panel-title">AI Fill Prediction</h3>
          </div>
        </div>
        <div className="panel-empty">
          <p>Select a bin to view time-series predictions</p>
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
          <Brain size={16} className="panel-header-icon text-emerald-700" />
          <h3 className="panel-title">AI Fill Prediction (24h Forecast)</h3>
        </div>
        <div className="prediction-confidence">
          <span className="confidence-label">Model Confidence</span>
          <span className="confidence-value" style={{ color: '#176B3A', fontWeight: 700 }}>94.6%</span>
        </div>
      </div>
      <p className="panel-subtitle">
        Forecasting trajectory for <strong>{bin.id}</strong> — {bin.location}
      </p>

      <div className="prediction-chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#176B3A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#176B3A" stopOpacity={0.02} />
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
              domain={[0, 100]}
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #DCE5DF',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#17221B',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <ReferenceLine
              y={bin.criticalThreshold}
              stroke="#DC2626"
              strokeDasharray="6 4"
              label={{ value: `Critical (${bin.criticalThreshold}%)`, fill: '#DC2626', fontSize: 10, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              fill="url(#fillGradGreen)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#176B3A"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#176B3A' }}
            />
            <Line
              type="monotone"
              dataKey="fill"
              stroke="#16A34A"
              strokeWidth={2}
              dot={{ r: 3, fill: '#16A34A' }}
              activeDot={{ r: 4, fill: '#16A34A' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {crossingPoint && (
        <div className="prediction-alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
          <AlertDot />
          <span>Predicted to cross critical threshold at <strong>{crossingPoint.label}</strong> ({crossingPoint.predicted}%)</span>
        </div>
      )}

      <div className="prediction-tag">
        <Info size={12} className="text-secondary" />
        <span>Time-series ultrasonic simulation • Updated in real time</span>
      </div>
    </div>
  );
}

function AlertDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: '#DC2626', display: 'inline-block',
      marginRight: 6, flexShrink: 0,
    }} />
  );
}
