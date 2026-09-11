// ==========================================
// WasteWiseAI — Live Event Feed
// ==========================================

import { Radio, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { EventLog } from '../types';

interface EventFeedProps {
  events: EventLog[];
}

const typeIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const typeColors = {
  critical: '#DC2626',
  warning: '#F59E0B',
  success: '#16A34A',
  info: '#0284C7',
};

export default function EventFeed({ events }: EventFeedProps) {
  return (
    <div className="panel event-feed-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <Radio size={16} className="panel-header-icon text-emerald-700" />
          <h3 className="panel-title">Live Operational Activity Log</h3>
        </div>
        <span className="live-indicator">
          <span className="live-dot" />
          Synchronized
        </span>
      </div>

      <div className="event-list">
        {events.slice(0, 12).map(evt => {
          const Icon = typeIcons[evt.type];
          const color = typeColors[evt.type] || '#0284C7';
          return (
            <div
              key={evt.id}
              className={`event-item event-item-${evt.type}`}
              style={{
                borderLeft: `3px solid ${color}`,
                paddingLeft: '10px',
                borderRadius: '0 6px 6px 0',
                background: '#FAFBF9',
              }}
            >
              <div className="event-icon" style={{ color }}>
                <Icon size={13} />
              </div>
              <div className="event-content">
                <span className="event-message">{evt.message}</span>
                <span className="event-time">{evt.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
