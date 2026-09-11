// ==========================================
// WasteWiseAI — Live Operations View
// ==========================================

import { useState, useMemo } from 'react';
import {
  Filter,
  MapPin,
  Truck,
  CheckCircle2,
  Zap,
  Activity,
  Shield,
  Radio,
} from 'lucide-react';
import LiveMap from '../components/LiveMap';
import EventFeed from '../components/EventFeed';
import { Bin, Truck as TruckType, RouteRecommendation, EventLog } from '../types';
import { getTimeToThreshold, getExplanation } from '../utils/riskScoring';
import { formatTruckId } from '../utils/truckDisplay';

interface LiveOperationsViewProps {
  bins: Bin[];
  trucks: TruckType[];
  selectedBinId: string | null;
  selectedBin: Bin | null;
  onSelectBin: (id: string) => void;
  onDispatchBin?: (id: string) => void;
  route: RouteRecommendation | null;
  events: EventLog[];
  onGenerateRoute: () => void;
  onApproveRoute: () => void;
  routeApproved: boolean;
}

type PriorityFilter = 'all' | 'critical' | 'high' | 'normal';

export default function LiveOperationsView({
  bins,
  trucks,
  selectedBinId,
  selectedBin,
  onSelectBin,
  onDispatchBin,
  route,
  events,
  onGenerateRoute,
  onApproveRoute,
  routeApproved,
}: LiveOperationsViewProps) {
  const [filter, setFilter] = useState<PriorityFilter>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'events'>('details');

  // Filter bins based on priority
  const displayedBins = useMemo(() => {
    if (filter === 'all') return bins;
    if (filter === 'critical') return bins.filter(b => b.priority === 'critical');
    if (filter === 'high') return bins.filter(b => b.priority === 'high');
    if (filter === 'normal') return bins.filter(b => b.priority === 'normal' || b.priority === 'medium');
    return bins;
  }, [bins, filter]);

  const activeBin = selectedBin || bins[0];
  const eta = getTimeToThreshold(activeBin);
  const explanations = getExplanation(activeBin);

  const counts = {
    all: bins.length,
    critical: bins.filter(b => b.priority === 'critical').length,
    high: bins.filter(b => b.priority === 'high').length,
    normal: bins.filter(b => b.priority === 'normal' || b.priority === 'medium').length,
  };

  const assignedTruckLabel = route ? formatTruckId(route.truckId) : '';

  return (
    <div className="live-ops-view">
      {/* Top Filter Bar */}
      <div className="ops-toolbar">
        <div className="ops-filter-group">
          <span className="ops-filter-label">
            <Filter size={14} /> Filter Geospatial Layer:
          </span>
          <button
            className={`ops-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Bins <span className="ops-badge">{counts.all}</span>
          </button>
          <button
            className={`ops-filter-btn critical ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical Only <span className="ops-badge red">{counts.critical}</span>
          </button>
          <button
            className={`ops-filter-btn high ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Priority <span className="ops-badge amber">{counts.high}</span>
          </button>
          <button
            className={`ops-filter-btn normal ${filter === 'normal' ? 'active' : ''}`}
            onClick={() => setFilter('normal')}
          >
            Normal / Low <span className="ops-badge green">{counts.normal}</span>
          </button>
        </div>

        <div className="ops-toolbar-actions">
          <div className="ops-fleet-status-pill">
            <Truck size={14} className="text-blue-600" />
            <span>
              {trucks.filter(t => t.status === 'on-route').length} of {trucks.length} Units Deployed
            </span>
          </div>
          {!route ? (
            <button className="btn-primary-green" onClick={onGenerateRoute}>
              <Zap size={14} /> Dispatch Recommended Route
            </button>
          ) : !routeApproved ? (
            <button className="btn-approve" onClick={onApproveRoute}>
              <CheckCircle2 size={14} /> Confirm Dispatch ({assignedTruckLabel})
            </button>
          ) : (
            <span className="status-dispatched-pill">
              <CheckCircle2 size={13} /> {assignedTruckLabel} Active on Route
            </span>
          )}
        </div>
      </div>

      {/* Main Operations Grid: Dominant Map + Right Telemetry Inspector */}
      <div className="ops-main-grid">
        {/* Left / Center: Large Map */}
        <div className="ops-map-wrapper">
          <LiveMap
            bins={displayedBins}
            trucks={trucks}
            selectedBinId={selectedBinId}
            onSelectBin={onSelectBin}
            onDispatchBin={onDispatchBin}
            route={route}
            height="100%"
          />
        </div>

        {/* Right Side: Selected Bin Telemetry Panel */}
        <div className="ops-sidebar-panel">
          <div className="ops-tabs">
            <button
              className={`ops-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <Activity size={14} /> Bin Telemetry
            </button>
            <button
              className={`ops-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <Radio size={14} /> Operations Feed
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="ops-bin-detail-card">
              {/* Card Header */}
              <div className="ops-bin-header">
                <div>
                  <div className="ops-bin-id-row">
                    <span className="ops-bin-id">{activeBin.id}</span>
                    <span className={`priority-badge priority-${activeBin.priority}`}>
                      {activeBin.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="ops-bin-location">
                    <MapPin size={13} /> {activeBin.location}
                  </div>
                </div>
                <div className="ops-bin-risk-score">
                  <div className="risk-score-value">{activeBin.riskScore}</div>
                  <div className="risk-score-label">RISK INDEX</div>
                </div>
              </div>

              {/* Quick Dispatch CTA Button */}
              {onDispatchBin && (
                <div style={{ marginTop: '10px', marginBottom: '6px' }}>
                  <button
                    className="btn-quick-dispatch-action"
                    onClick={() => onDispatchBin(activeBin.id)}
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
                      cursor: 'pointer',
                    }}
                  >
                    <Zap size={14} /> Expedite Collection for {activeBin.id}
                  </button>
                </div>
              )}

              {/* Fill Gauge Progress Bar */}
              <div className="ops-fill-section">
                <div className="ops-fill-label-row">
                  <span className="text-secondary font-medium">Current Fill Capacity</span>
                  <span className="font-bold text-dark">{activeBin.fillLevel}%</span>
                </div>
                <div className="ops-fill-bar-track">
                  <div
                    className="ops-fill-bar-fill"
                    style={{
                      width: `${activeBin.fillLevel}%`,
                      background:
                        activeBin.fillLevel >= 85
                          ? 'var(--accent-red)'
                          : activeBin.fillLevel >= 70
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)',
                    }}
                  />
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="ops-metrics-grid">
                <div className="ops-metric-box">
                  <span className="ops-metric-label">Filling Rate</span>
                  <span className="ops-metric-value text-emerald-800">+{activeBin.fillRate}%/h</span>
                  <span className="ops-metric-sub">Ultrasonic delta</span>
                </div>

                <div className="ops-metric-box">
                  <span className="ops-metric-label">Time to Critical</span>
                  <span className={`ops-metric-value ${eta <= 4 ? 'text-red-600' : 'text-slate-800'}`}>
                    {eta > 0 ? `${eta} hrs` : 'IMMEDIATE'}
                  </span>
                  <span className="ops-metric-sub">Threshold: 90%</span>
                </div>

                <div className="ops-metric-box">
                  <span className="ops-metric-label">Predicted 6h</span>
                  <span className="ops-metric-value">{activeBin.predictedFill6h}%</span>
                  <span className="ops-metric-sub">Forecasting curve</span>
                </div>

                <div className="ops-metric-box">
                  <span className="ops-metric-label">Predicted 12h</span>
                  <span className="ops-metric-value text-amber-600">{activeBin.predictedFill12h}%</span>
                  <span className="ops-metric-sub">End of shift</span>
                </div>
              </div>

              {/* Hardware Telemetry Specs */}
              <div className="ops-sensor-specs">
                <div className="spec-title">Hardware Telemetry & Metadata</div>
                <div className="spec-row">
                  <span className="spec-name">Zone Classification</span>
                  <span className="spec-val capitalize">{activeBin.zoneType} District</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Sensor Status</span>
                  <span className="spec-val text-emerald-700">Online • LoRaWAN Gateway #3</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Internal Battery</span>
                  <span className="spec-val">3.6V Li-SOCl2 (94%)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Last Serviced</span>
                  <span className="spec-val">{activeBin.lastCollected}</span>
                </div>
              </div>

              {/* AI Assessment Notes */}
              <div className="ops-ai-assessment">
                <div className="assessment-title">
                  <Shield size={13} className="text-emerald-700" /> Dispatch Recommendation
                </div>
                <p className="assessment-text">
                  {explanations[0] || 'Standard fill progression. Normal routing schedule applicable.'}
                </p>
              </div>

              {/* Quick Select from Priority Critical Bins */}
              <div className="ops-quick-select">
                <div className="quick-select-title">Priority Critical Bins:</div>
                <div className="quick-select-chips">
                  {bins
                    .filter(b => b.priority === 'critical' || b.priority === 'high')
                    .slice(0, 5)
                    .map(b => (
                      <button
                        key={b.id}
                        className={`quick-chip ${activeBin.id === b.id ? 'active' : ''}`}
                        onClick={() => onSelectBin(b.id)}
                      >
                        {b.id} ({b.fillLevel}%)
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="ops-events-container">
              <EventFeed events={events} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
