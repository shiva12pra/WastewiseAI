// ==========================================
// WasteWiseAI — Critical Bins Panel
// ==========================================

import { AlertTriangle } from 'lucide-react';
import { Bin } from '../types';
import { getTimeToThreshold } from '../utils/riskScoring';

interface CriticalBinsPanelProps {
  bins: Bin[];
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
}

export default function CriticalBinsPanel({ bins, selectedBinId, onSelectBin }: CriticalBinsPanelProps) {
  const criticalBins = [...bins]
    .filter(b => b.riskScore >= 40)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  return (
    <div className="panel critical-bins-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <AlertTriangle size={16} className="panel-header-icon critical" />
          <h3 className="panel-title">Critical Bins</h3>
        </div>
        <span className="panel-count">{criticalBins.length} bins</span>
      </div>

      <div className="critical-bins-list">
        {criticalBins.map(bin => {
          const eta = getTimeToThreshold(bin);
          return (
            <div
              key={bin.id}
              className={`critical-bin-row ${selectedBinId === bin.id ? 'selected' : ''}`}
              onClick={() => onSelectBin(bin.id)}
            >
              <div className="critical-bin-info">
                <span className="critical-bin-id">{bin.id}</span>
                <span className="critical-bin-location">{bin.location}</span>
              </div>
              <div className="critical-bin-metrics">
                <div className="critical-bin-fill">
                  <div className="fill-bar-track">
                    <div
                      className="fill-bar-fill"
                      style={{
                        width: `${bin.fillLevel}%`,
                        background: bin.fillLevel >= 85 ? 'var(--accent-red)' :
                          bin.fillLevel >= 70 ? 'var(--accent-amber)' : 'var(--accent-blue)',
                      }}
                    />
                  </div>
                  <span className="critical-bin-pct">{bin.fillLevel}%</span>
                </div>
                <div className="critical-bin-meta">
                  <span className="critical-bin-pred">→{bin.predictedFill6h}%</span>
                  <span className="critical-bin-eta">{eta > 0 ? `${eta}h` : 'Now'}</span>
                  <span className={`priority-badge priority-${bin.priority}`}>{bin.priority}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
