// ==========================================
// WasteWiseAI — Action Required Panel
// Answers: "WHAT should we do?"
// ==========================================

import { AlertTriangle, Clock, TrendingUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Bin } from '../types';
import { getTimeToThreshold } from '../utils/riskScoring';

interface CriticalBinsPanelProps {
  bins: Bin[];
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
  onDispatchBin?: (id: string) => void;
}

export default function CriticalBinsPanel({
  bins,
  selectedBinId,
  onSelectBin,
  onDispatchBin,
}: CriticalBinsPanelProps) {
  const criticalBins = [...bins]
    .filter(b => b.riskScore >= 40)
    .sort((a, b) => b.riskScore - a.riskScore);

  const topCritical = bins.find(b => b.id === selectedBinId) || criticalBins[0] || bins[0];
  const topEta = getTimeToThreshold(topCritical);

  return (
    <div className="panel action-required-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="panel-header" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-secondary)' }}>
        <div className="panel-header-left">
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: '#FEE2E2', color: '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <h3 className="panel-title" style={{ fontSize: '14px', fontWeight: 800, color: '#17221B' }}>
              Action Required
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Priority Decisions & Dispatch
            </span>
          </div>
        </div>
        <span className="panel-count" style={{ background: '#FEE2E2', color: '#B91C1C', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
          {criticalBins.filter(b => b.priority === 'critical').length} Critical
        </span>
      </div>

      {/* Featured Immediate Action Box — Answers "WHAT should we do?" */}
      <div className="action-featured-card" style={{
        margin: '12px 0 10px 0',
        padding: '12px',
        background: '#FFF8F8',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.5px' }}>
            ⚡ RECOMMENDED IMMEDIATE DISPATCH
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
            background: topCritical.priority === 'critical' ? '#DC2626' : '#F59E0B',
            color: '#FFFFFF'
          }}>
            {topCritical.priority.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#17221B' }}>{topCritical.id}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>
            {topCritical.fillLevel}% Fill • {topEta > 0 ? `${topEta}h to overflow` : 'Overflow Risk!'}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: '#4B5563', margin: '4px 0 8px 0' }}>
          {topCritical.location} ({topCritical.zoneType} sector)
        </div>

        {onDispatchBin && (
          <button
            className="btn-expedite-dispatch"
            onClick={() => onDispatchBin(topCritical.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#176B3A',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(23, 107, 58, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <Zap size={14} /> Dispatch Collection Unit Now
          </button>
        )}
      </div>

      {/* Action Queue Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          Pending Action Queue ({criticalBins.length})
        </span>
        <span style={{ fontSize: '10px', color: '#64748B' }}>Ranked by Risk Score</span>
      </div>

      {/* Scrollable Action Queue */}
      <div className="critical-bins-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
        {criticalBins.map(bin => {
          const eta = getTimeToThreshold(bin);
          const isSelected = selectedBinId === bin.id;

          return (
            <div
              key={bin.id}
              className={`critical-bin-row ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectBin(bin.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                border: isSelected ? '1.5px solid #176B3A' : '1px solid #E2E8F0',
                background: isSelected ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '12px', color: '#17221B' }}>{bin.id}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                    background: bin.priority === 'critical' ? '#FEE2E2' : '#FEF3C7',
                    color: bin.priority === 'critical' ? '#B91C1C' : '#B45309',
                  }}>
                    {bin.priority.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>{bin.location}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: bin.fillLevel >= 85 ? '#DC2626' : '#F59E0B' }}>
                    {bin.fillLevel}%
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#64748B' }}>
                    {eta > 0 ? `${eta}h to overflow` : 'Overflowing'}
                  </div>
                </div>

                {onDispatchBin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatchBin(bin.id);
                    }}
                    title={`Dispatch collection vehicle to ${bin.id}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      background: '#176B3A',
                      color: '#FFFFFF',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Dispatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
