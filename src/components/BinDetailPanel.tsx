// ==========================================
// WasteWiseAI — Bin Detail & Risk Score Panel
// ==========================================

import { MapPin, Clock, Gauge, TrendingUp, Shield, Info, Zap } from 'lucide-react';
import { Bin } from '../types';
import { getTimeToThreshold, getExplanation } from '../utils/riskScoring';

interface BinDetailPanelProps {
  bin: Bin | null;
  fillRateMultiplier: number;
  onDispatchBin?: (id: string) => void;
}

export default function BinDetailPanel({ bin, fillRateMultiplier, onDispatchBin }: BinDetailPanelProps) {
  if (!bin) {
    return (
      <div className="panel bin-detail-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <MapPin size={16} className="panel-header-icon blue" />
            <h3 className="panel-title">Bin Details</h3>
          </div>
        </div>
        <div className="panel-empty">
          <p>Select a bin on the map or from the critical bins list</p>
        </div>
      </div>
    );
  }

  const eta = getTimeToThreshold(bin, fillRateMultiplier);
  const explanations = getExplanation(bin, fillRateMultiplier);

  return (
    <div className="panel bin-detail-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <MapPin size={16} className="panel-header-icon blue" />
          <h3 className="panel-title">Bin Details</h3>
        </div>
        <span className={`priority-badge priority-${bin.priority}`}>{bin.priority.toUpperCase()}</span>
      </div>

      <div className="bin-detail-header">
        <div className="bin-detail-id">{bin.id}</div>
        <div className="bin-detail-location">{bin.location} • {bin.zoneType} District</div>
      </div>

      <div className="bin-detail-grid">
        <div className="bin-stat">
          <Gauge size={14} className="text-emerald-700" />
          <div>
            <span className="bin-stat-label">Current Fill</span>
            <span className="bin-stat-value">{bin.fillLevel}%</span>
          </div>
        </div>
        <div className="bin-stat">
          <TrendingUp size={14} className="text-amber-600" />
          <div>
            <span className="bin-stat-label">Filling Rate</span>
            <span className="bin-stat-value">+{bin.fillRate}%/hr</span>
          </div>
        </div>
        <div className="bin-stat">
          <Clock size={14} className="text-blue-600" />
          <div>
            <span className="bin-stat-label">Predicted in 6 Hours</span>
            <span className="bin-stat-value">{bin.predictedFill6h}%</span>
          </div>
        </div>
        <div className="bin-stat">
          <Clock size={14} className={eta <= 3 ? 'text-red-600' : 'text-slate-600'} />
          <div>
            <span className="bin-stat-label">Time to Critical</span>
            <span className="bin-stat-value">{eta > 0 ? `${eta}h` : 'Immediate'}</span>
          </div>
        </div>
      </div>

      {/* Risk Score */}
      <div className="risk-score-section">
        <div className="risk-score-header">
          <Shield size={14} className="text-emerald-700" />
          <span>Dynamic Risk Score</span>
        </div>
        <div className="risk-score-display">
          <div className="risk-score-ring">
            <svg viewBox="0 0 80 80" className="risk-ring-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={bin.riskScore >= 80 ? '#DC2626' : bin.riskScore >= 60 ? '#F59E0B' : '#16A34A'}
                strokeWidth="6"
                strokeDasharray={`${(bin.riskScore / 100) * 213.6} 213.6`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <span className="risk-score-number">{bin.riskScore}</span>
          </div>
          <span className="risk-score-max">/ 100 Risk Score</span>
        </div>
      </div>

      {/* Quick Dispatch Action Button */}
      {onDispatchBin && (
        <div className="bin-quick-dispatch-wrapper" style={{ marginTop: '12px', marginBottom: '8px' }}>
          <button
            className="btn-quick-dispatch-action"
            onClick={() => onDispatchBin(bin.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#176B3A',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(23, 107, 58, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <Zap size={14} /> Add to Route & Dispatch
          </button>
        </div>
      )}

      {/* Explainable AI */}
      <div className="explainable-section">
        <div className="explainable-header">
          <Info size={14} className="text-emerald-700" />
          <span>Why WasteWiseAI prioritized this bin</span>
        </div>
        <ul className="explainable-list">
          {explanations.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="bin-detail-meta">
        <span>Last serviced: {bin.lastCollected}</span>
      </div>
    </div>
  );
}
