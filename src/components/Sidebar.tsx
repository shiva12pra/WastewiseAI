// ==========================================
// WasteWiseAI — Professional Municipal Sidebar
// ==========================================

import {
  LayoutDashboard,
  Radio,
  BarChart3,
  Route,
  Truck,
  FlaskConical,
  TrendingUp,
  Leaf,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  criticalCount?: number;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'live-ops', label: 'Live Operations', icon: Radio, badge: 'Live' },
  { id: 'predictions', label: 'Bin Predictions', icon: BarChart3, badge: null },
  { id: 'routes', label: 'Route Optimization', icon: Route, badge: null },
  { id: 'fleet', label: 'Fleet', icon: Truck, badge: '12' },
  { id: 'scenarios', label: 'Scenarios', icon: FlaskConical, badge: null },
  { id: 'impact', label: 'Impact', icon: TrendingUp, badge: 'AI vs Fixed' },
];

export default function Sidebar({ activeNav, setActiveNav, criticalCount = 5 }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={20} className="brand-leaf-icon" />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-brand">
            WASTEWISE<span className="sidebar-brand-ai">AI</span>
          </div>
          <div className="sidebar-tagline">Smarter Cities • Cleaner Tomorrow</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">OPERATIONS CONTROL</div>
        <div className="sidebar-nav-section">
          {navItems.map(item => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                type="button"
                id={`nav-${item.id}`}
              >
                <div className="nav-item-icon-wrapper">
                  <Icon size={18} />
                </div>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-item-badge ${item.id === 'live-ops' ? 'badge-pulse' : ''}`}>
                    {item.badge}
                  </span>
                )}
                {item.id === 'live-ops' && criticalCount > 0 && (
                  <span className="nav-item-alert-dot" title={`${criticalCount} Critical Bins`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer / Municipal Badge */}
      <div className="sidebar-footer">
        <div className="sidebar-dept-badge">
          <div className="dept-badge-icon">
            <ShieldCheck size={16} />
          </div>
          <div className="dept-badge-text">
            <span className="dept-title">Dept. of Sanitation</span>
            <span className="dept-sub">Central Command v2.4</span>
          </div>
        </div>
        <div className="sidebar-ev-banner">
          <ShieldCheck size={13} className="text-emerald-700" />
          <span>Municipal Fleet Operations</span>
        </div>
      </div>
    </aside>
  );
}
