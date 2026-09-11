// ==========================================
// WasteWiseAI — Clean Light Header Bar
// ==========================================

import { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Search,
  User,
  X,
  MapPin,
  Truck,
  CheckCircle,
  Info,
  AlertCircle,
} from 'lucide-react';
import { ScenarioType, Bin, Truck as TruckType, EventLog } from '../types';
import { formatTruckId } from '../utils/truckDisplay';

interface HeaderProps {
  activeNav: string;
  activeScenario: ScenarioType;
  bins: Bin[];
  trucks: TruckType[];
  events?: EventLog[];
  onSelectBin: (id: string) => void;
  onNavigate: (nav: string) => void;
}

const navTitles: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Command Center Overview',
    subtitle: 'Municipal Waste Management & Smart City Geospatial Telemetry',
  },
  'live-ops': {
    title: 'Live Operations Map',
    subtitle: 'Real-time Bin Levels, Fleet Telemetry & On-Demand Actions',
  },
  predictions: {
    title: 'AI Bin Fill Predictions',
    subtitle: 'Time-Series Forecasting & Overflow Risk Assessment',
  },
  routes: {
    title: 'Dynamic Route Optimization',
    subtitle: 'Demand-Driven Dispatch & Battery-Optimized Routing',
  },
  fleet: {
    title: 'Fleet Operations Management',
    subtitle: 'Municipal Waste Collection Fleet Operations',
  },
  scenarios: {
    title: 'Operational Scenario Simulator',
    subtitle: 'Stress Testing: Weather, Festivals, Congestion & Failover',
  },
  impact: {
    title: 'Environmental & Operational Impact',
    subtitle: 'Simulated Comparison: Fixed Schedule vs WasteWiseAI',
  },
};

export default function Header({
  activeNav,
  activeScenario,
  bins,
  trucks,
  events = [],
  onSelectBin,
  onNavigate,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentNav = navTitles[activeNav] || navTitles.overview;

  const searchResults = searchQuery.trim() === '' ? [] : [
    ...bins
      .filter(
        b =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 4)
      .map(b => ({ type: 'bin' as const, id: b.id, title: b.id, subtitle: `${b.location} (${b.fillLevel}% fill)` })),
    ...trucks
      .filter(
        t =>
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatTruckId(t.id).toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map(t => ({ type: 'truck' as const, id: t.id, title: formatTruckId(t.id), subtitle: `Status: ${t.status} • Reserve: ${t.battery}%` })),
  ];

  return (
    <header className="header">
      {/* Left: Section Title, Subtitle & Breadcrumb */}
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="breadcrumb-root">WasteWiseAI</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentNav.title}</span>
        </div>
        <div className="header-title-row">
          <h1 className="header-title">{currentNav.title}</h1>
          <span className="header-subtitle-text" style={{ fontSize: '11px', color: '#64748B', marginLeft: '8px' }}>
            • {currentNav.subtitle}
          </span>
          {activeScenario !== 'normal' && (
            <span className="header-scenario-badge">
              <AlertTriangle size={12} />
              Scenario: {activeScenario.replace('-', ' ').toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="header-search-container">
        <div className="header-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search bin, collection vehicle or location..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            <div className="search-dropdown-header">Quick Results</div>
            {searchResults.map(res => (
              <button
                key={`${res.type}-${res.id}`}
                className="search-result-item"
                onClick={() => {
                  if (res.type === 'bin') {
                    onSelectBin(res.id);
                    onNavigate('live-ops');
                  } else {
                    onNavigate('fleet');
                  }
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                {res.type === 'bin' ? (
                  <MapPin size={14} className="text-emerald-700" />
                ) : (
                  <Truck size={14} className="text-blue-700" />
                )}
                <div className="search-result-text">
                  <span className="search-result-title">{res.title}</span>
                  <span className="search-result-sub">{res.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Status, Notifications & Profile */}
      <div className="header-right">
        {/* System Status Pill */}
        <div className={`header-status-pill ${activeScenario === 'normal' ? 'status-ok' : 'status-alert'}`}>
          {activeScenario === 'normal' ? (
            <>
              <span className="status-dot-pulse" />
              <span className="status-text">All Systems Operational</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} className="text-amber-600" />
              <span className="status-text">Simulation Active</span>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <div className="header-action-wrapper">
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Operational Alerts"
            id="notifications-btn"
          >
            <Bell size={18} />
            <span className="header-notif-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>Operational Alerts</span>
                <span className="notif-count">{Math.min(events.length, 5)} Recent</span>
              </div>
              <div className="notif-list">
                {events.slice(0, 5).map(evt => {
                  const dotColor = evt.type === 'critical' ? '#DC2626' : evt.type === 'warning' ? '#F59E0B' : evt.type === 'success' ? '#16A34A' : '#0284C7';
                  return (
                    <div key={evt.id} className="notif-item">
                      <div className="notif-dot" style={{ background: dotColor }} />
                      <div className="notif-content">
                        <p className="notif-msg">{evt.message}</p>
                        <span className="notif-time">{evt.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile */}
        <div className="header-operator-card">
          <div className="operator-avatar">
            <User size={16} />
          </div>
          <div className="operator-info">
            <span className="operator-name">Sarah Miller</span>
            <span className="operator-role">Central Dispatcher</span>
          </div>
        </div>
      </div>
    </header>
  );
}
