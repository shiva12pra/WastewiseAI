// ==========================================
// WasteWiseAI — Fleet Management View
// ==========================================

import { useState } from 'react';
import {
  Truck as TruckIcon,
  Battery,
  Package,
  Filter,
} from 'lucide-react';
import { Truck } from '../types';
import { formatTruckId, getTruckModelName } from '../utils/truckDisplay';

interface FleetViewProps {
  trucks: Truck[];
  onUpdateTruckStatus?: (truckId: string, status: Truck['status']) => void;
}

export default function FleetView({ trucks }: FleetViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'assigned' | 'standby'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTrucks = trucks.filter(t => {
    const isAssigned = t.status === 'on-route' || t.status === 'recommended';
    if (filterType === 'assigned' && !isAssigned) return false;
    if (filterType === 'standby' && isAssigned) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const activeTrucks = trucks.filter(t => t.status === 'on-route' || t.status === 'recommended');
  const avgEnergy = Math.round(
    trucks.reduce((acc, t) => acc + t.battery, 0) / (trucks.length || 1)
  );

  return (
    <div className="fleet-view">
      {/* Top Fleet Overview KPI Row */}
      <div className="fleet-kpi-row">
        <div className="fleet-kpi-card">
          <div className="fleet-kpi-label">Total Municipal Fleet</div>
          <div className="fleet-kpi-val">{trucks.length} Vehicles</div>
          <div className="fleet-kpi-sub">Municipal Collection Fleet Units</div>
        </div>

        <div className="fleet-kpi-card">
          <div className="fleet-kpi-label">Active on Routes</div>
          <div className="fleet-kpi-val text-blue-700">{activeTrucks.length} Deployed</div>
          <div className="fleet-kpi-sub">{Math.round((activeTrucks.length / trucks.length) * 100)}% active fleet deployment</div>
        </div>

        <div className="fleet-kpi-card">
          <div className="fleet-kpi-label">Average Fleet Energy Reserve</div>
          <div className="fleet-kpi-val text-emerald-800">{avgEnergy}%</div>
          <div className="fleet-kpi-sub">Optimal operational reserve envelope</div>
        </div>

        <div className="fleet-kpi-card">
          <div className="fleet-kpi-label">Fleet Mission Readiness</div>
          <div className="fleet-kpi-val text-emerald-700">91.7%</div>
          <div className="fleet-kpi-sub">11 of 12 units operational & ready</div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="fleet-toolbar">
        <div className="fleet-filter-group">
          <span className="fleet-toolbar-label">
            <Filter size={14} /> Fleet Filter:
          </span>
          <button
            className={`fleet-btn-filter ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Fleet Units ({trucks.length})
          </button>
          <button
            className={`fleet-btn-filter ${filterType === 'assigned' ? 'active' : ''}`}
            onClick={() => setFilterType('assigned')}
          >
            🚛 Dispatched Units ({activeTrucks.length})
          </button>
          <button
            className={`fleet-btn-filter ${filterType === 'standby' ? 'active' : ''}`}
            onClick={() => setFilterType('standby')}
          >
            Standby / Reserve ({trucks.length - activeTrucks.length})
          </button>
        </div>

        <div className="fleet-status-filter-group">
          <label className="text-xs text-secondary mr-2">Status:</label>
          <select
            className="fleet-select-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="on-route">On Route</option>
            <option value="idle">Available / Idle</option>
            <option value="charging">Depot Standby / Charging</option>
            <option value="near-capacity">Near Capacity</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Grid of Vehicle Cards */}
      <div className="fleet-cards-grid">
        {filteredTrucks.map(truck => {
          const isLowEnergy = truck.battery < 30;
          const isNearCap = truck.load >= 80;
          const displayName = formatTruckId(truck.id);
          const modelName = getTruckModelName(truck);

          return (
            <div
              key={truck.id}
              className={`fleet-vehicle-card ${truck.status === 'unavailable' ? 'vehicle-unavailable' : ''}`}
            >
              {/* Card Header */}
              <div className="vehicle-card-header">
                <div className="vehicle-id-group">
                  <div className="vehicle-type-icon ev">
                    <TruckIcon size={16} />
                  </div>
                  <div>
                    <div className="vehicle-name-row">
                      <span className="vehicle-id">{displayName}</span>
                      <span className="vehicle-model">{modelName}</span>
                    </div>
                    <span className="vehicle-assigned-route">
                      {truck.assignedRoute ? `Assigned: ${truck.assignedRoute}` : 'Standby / Unassigned'}
                    </span>
                  </div>
                </div>

                <span className={`status-badge status-${truck.status}`}>
                  {truck.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Vehicle Health & Capacity Metrics */}
              <div className="vehicle-card-body">
                {/* Energy Level Section */}
                <div className="vehicle-metric-row">
                  <div className="metric-label-row">
                    <span className="metric-label">
                      <Battery size={13} /> Operational Energy Reserve
                    </span>
                    <span className={`metric-val ${isLowEnergy ? 'text-red-600 font-bold' : ''}`}>
                      {truck.battery}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${truck.battery}%`,
                        background:
                          truck.battery >= 60
                            ? 'var(--accent-emerald)'
                            : truck.battery >= 30
                            ? 'var(--accent-amber)'
                            : 'var(--accent-red)',
                      }}
                    />
                  </div>
                </div>

                {/* Load Capacity Section */}
                <div className="vehicle-metric-row">
                  <div className="metric-label-row">
                    <span className="metric-label">
                      <Package size={13} /> Waste Payload
                    </span>
                    <span className={`metric-val ${isNearCap ? 'text-red-600 font-bold' : ''}`}>
                      {truck.load}% ({Math.round((truck.load / 100) * 2400)} / 2,400 kg)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${truck.load}%`,
                        background: isNearCap ? 'var(--accent-red)' : '#0284C7',
                      }}
                    />
                  </div>
                </div>

                {/* Technical Specs List */}
                <div className="vehicle-specs-list">
                  <div className="spec-item">
                    <span className="spec-k">GPS Coordinates</span>
                    <span className="spec-v font-mono">{truck.lat.toFixed(4)}°N, {truck.lng.toFixed(4)}°E</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-k">Telemetry</span>
                    <span className="spec-v text-emerald-700">CAN-Bus Live • 2s sync</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-k">Payload Capacity</span>
                    <span className="spec-v">2.4 Metric Tons</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Municipal Fleet Registry Table */}
      <div className="panel fleet-table-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <TruckIcon size={16} className="text-emerald-700" />
            <h3 className="panel-title">Municipal Fleet Operational Registry</h3>
          </div>
          <span className="panel-count">{filteredTrucks.length} Vehicles Listed</span>
        </div>

        <div className="fleet-table-wrapper">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Vehicle Unit</th>
                <th>Model Class</th>
                <th>Energy Reserve</th>
                <th>Current Payload</th>
                <th>Operational Status</th>
                <th>Assigned Route</th>
                <th>Assigned Bins</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrucks.map(truck => (
                <tr key={truck.id}>
                  <td className="font-bold text-dark">{formatTruckId(truck.id)}</td>
                  <td>
                    <span className="powertrain-tag ev">
                      {getTruckModelName(truck)}
                    </span>
                  </td>
                  <td>
                    <div className="table-battery-cell">
                      <div className="battery-bar-mini">
                        <div
                          className="battery-fill-mini"
                          style={{
                            width: `${truck.battery}%`,
                            background:
                              truck.battery >= 60
                                ? 'var(--accent-emerald)'
                                : truck.battery >= 30
                                ? 'var(--accent-amber)'
                                : 'var(--accent-red)',
                          }}
                        />
                      </div>
                      <span>{truck.battery}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold">{truck.load}%</span>
                    <span className="text-secondary text-xs ml-1">({Math.round((truck.load / 100) * 2400)} kg)</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${truck.status}`}>
                      {truck.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{truck.assignedRoute || <span className="text-secondary">—</span>}</td>
                  <td>
                    {truck.assignedBins.length > 0 ? (
                      <span className="bins-tag">{truck.assignedBins.join(', ')}</span>
                    ) : (
                      <span className="text-secondary">Standby</span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-secondary">
                    {truck.lat.toFixed(3)}, {truck.lng.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
