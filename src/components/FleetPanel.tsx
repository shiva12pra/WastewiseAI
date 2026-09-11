// ==========================================
// WasteWiseAI — Fleet Panel
// ==========================================

import { Truck as TruckIcon, Battery, Package } from 'lucide-react';
import { Truck } from '../types';

interface FleetPanelProps {
  trucks: Truck[];
}

export default function FleetPanel({ trucks }: FleetPanelProps) {
  const primaryTrucks = trucks.slice(0, 6);
  const secondaryTrucks = trucks.slice(6, 12);

  return (
    <div className="panel fleet-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <TruckIcon size={16} className="text-emerald-700" />
          <h3 className="panel-title">Fleet Status</h3>
        </div>
        <span className="panel-count">{trucks.length} Units</span>
      </div>

      <div className="fleet-section-label">
        <TruckIcon size={12} /> Primary Operations Fleet
      </div>
      <div className="fleet-grid">
        {primaryTrucks.map(truck => (
          <TruckCard key={truck.id} truck={truck} />
        ))}
      </div>

      <div className="fleet-section-label">
        <TruckIcon size={12} /> Support & Reserve Fleet
      </div>
      <div className="fleet-grid">
        {secondaryTrucks.map(truck => (
          <TruckCard key={truck.id} truck={truck} />
        ))}
      </div>
    </div>
  );
}

function TruckCard({ truck }: { truck: Truck }) {
  const batteryColor = truck.battery >= 60 ? 'var(--accent-emerald)' :
    truck.battery >= 30 ? 'var(--accent-amber)' : 'var(--accent-red)';

  const statusColors: Record<string, string> = {
    'on-route': 'var(--accent-blue)',
    'idle': 'var(--text-dim)',
    'charging': 'var(--accent-amber)',
    'recommended': 'var(--accent-primary)',
    'near-capacity': 'var(--accent-red)',
    'unavailable': 'var(--text-dim)',
  };

  return (
    <div className={`truck-card ${truck.status === 'unavailable' ? 'truck-unavailable' : ''}`}>
      <div className="truck-card-header">
        <span className="truck-id">{truck.id}</span>
        <span
          className="truck-status-dot"
          style={{ background: statusColors[truck.status] || '#64748B' }}
        />
      </div>

      <div className="truck-battery">
        <div className="truck-battery-bar">
          <div
            className="truck-battery-fill"
            style={{ width: `${truck.battery}%`, background: batteryColor }}
          />
        </div>
        <span className="truck-battery-label">
          <Battery size={11} /> Energy: {truck.battery}%
        </span>
      </div>

      <div className="truck-load">
        <div className="truck-load-bar">
          <div
            className="truck-load-fill"
            style={{
              width: `${truck.load}%`,
              background: truck.load >= 85 ? 'var(--accent-red)' : 'var(--accent-blue)',
            }}
          />
        </div>
        <span className="truck-load-label">
          <Package size={11} /> Load: {truck.load}%
        </span>
      </div>

      <div className="truck-status-label" style={{ color: statusColors[truck.status] || '#64748B' }}>
        {truck.status.replace('-', ' ')}
      </div>
    </div>
  );
}
