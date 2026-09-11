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
  critical: 'var(--accent-red)',
  warning: 'var(--accent-amber)',
  success: 'var(--accent-emerald)',
  info: 'var(--accent-blue)',
};

export default function EventFeed({ events }: EventFeedProps) {
  return (
    <div className="panel event-feed-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <Radio size={16} className="panel-header-icon blue" />
          <h3 className="panel-title">Recent Events</h3>
        </div>
        <span className="live-indicator">
          <span className="live-dot" />
          Live
        </span>
      </div>

      <div className="event-list">
        {events.slice(0, 12).map(evt => {
          const Icon = typeIcons[evt.type];
          return (
            <div key={evt.id} className="event-item">
              <div className="event-icon" style={{ color: typeColors[evt.type] }}>
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
