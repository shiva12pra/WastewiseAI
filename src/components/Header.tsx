// ==========================================================
// WasteWiseAI — Clean Minimal Global Top Header
// ==========================================================

import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  User,
  X,
  MapPin,
  Truck,
  AlertTriangle,
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

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  'live-ops': 'Live Operations',
  predictions: 'Bin Predictions',
  routes: 'Route Optimization',
  fleet: 'Fleet',
  scenarios: 'Scenarios',
  impact: 'Impact',
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

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const currentPageTitle = PAGE_TITLES[activeNav] || 'Overview';

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim() === '' ? [] : [
    ...bins
      .filter(
        b =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 4)
      .map(b => ({
        type: 'bin' as const,
        id: b.id,
        title: b.id,
        subtitle: `${b.location} (${b.fillLevel}% fill)`,
      })),
    ...trucks
      .filter(
        t =>
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatTruckId(t.id).toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map(t => ({
        type: 'truck' as const,
        id: t.id,
        title: formatTruckId(t.id),
        subtitle: `Status: ${t.status} • Battery: ${t.battery}%`,
      })),
  ];

  return (
    <header className="header" id="global-header">
      {/* LEFT: WasteWiseAI brand mark + Current Page Title only */}
      <div className="header-left">
        <span className="header-brand-mark">WasteWiseAI</span>
        <span className="header-divider" aria-hidden="true" />
        <h1 className="header-page-title">{currentPageTitle}</h1>

        {activeScenario !== 'normal' && (
          <span className="header-scenario-tag" title={`Active Scenario: ${activeScenario}`}>
            <AlertTriangle size={12} />
            <span>{activeScenario.replace('-', ' ')}</span>
          </span>
        )}
      </div>

      {/* RIGHT: Compact Search + Subtle Status + Notification + Operator */}
      <div className="header-right">
        {/* Compact Search */}
        <div className="header-search-container" ref={searchContainerRef}>
          <div className="header-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search bins or trucks..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim() !== '') setIsSearchOpen(true);
              }}
              aria-label="Search bins or trucks"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Compact Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              <div className="search-dropdown-header">Quick Results</div>
              {searchResults.map(res => (
                <button
                  type="button"
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
                    <MapPin size={13} className="text-emerald-700" />
                  ) : (
                    <Truck size={13} className="text-blue-700" />
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

        {/* Subtle System Status Indicator (Not a giant pill) */}
        <div
          className={`header-status-indicator ${
            activeScenario === 'normal' ? 'status-normal' : 'status-scenario'
          }`}
          title={
            activeScenario === 'normal'
              ? 'All municipal collection systems operational'
              : `Scenario Active: ${activeScenario}`
          }
        >
          <span className="status-indicator-dot" />
          <span className="status-indicator-label">
            {activeScenario === 'normal' ? 'Operational' : 'Simulation Active'}
          </span>
        </div>

        {/* Compact Notification Icon */}
        <div className="header-action-wrapper" ref={notifContainerRef}>
          <button
            type="button"
            className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(prev => !prev)}
            title="Operational Alerts"
            id="notifications-btn"
            aria-label="Operational Alerts"
          >
            <Bell size={16} />
            {events.length > 0 && <span className="header-notif-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>Operational Alerts</span>
                <span className="notif-count">
                  {Math.min(events.length, 5)} Recent
                </span>
              </div>
              <div className="notif-list">
                {events.length === 0 ? (
                  <div className="notif-empty">No active alerts</div>
                ) : (
                  events.slice(0, 5).map(evt => {
                    const dotColor =
                      evt.type === 'critical'
                        ? '#DC2626'
                        : evt.type === 'warning'
                        ? '#F59E0B'
                        : evt.type === 'success'
                        ? '#16A34A'
                        : '#0284C7';
                    return (
                      <div key={evt.id} className="notif-item">
                        <div
                          className="notif-dot"
                          style={{ background: dotColor }}
                        />
                        <div className="notif-content">
                          <p className="notif-msg">{evt.message}</p>
                          <span className="notif-time">{evt.timestamp}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Operator Profile */}
        <div className="header-operator" title="Current Operator">
          <div className="operator-avatar">
            <User size={14} />
          </div>
          <div className="operator-details">
            <span className="operator-name">Sarah Miller</span>
            <span className="operator-role">Dispatcher</span>
          </div>
        </div>
      </div>
    </header>
  );
}
