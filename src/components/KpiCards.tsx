// ==========================================
// WasteWiseAI — KPI Cards Row
// ==========================================

import { Package, AlertTriangle, Truck, TrendingUp, MapPin } from 'lucide-react';
import { KpiData } from '../types';

interface KpiCardsProps {
  kpis: KpiData;
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      label: 'Total Bins',
      value: kpis.totalBins.toLocaleString(),
      sub: '+4.2%',
      icon: Package,
      color: 'var(--accent-blue)',
      trend: 'up' as const,
    },
    {
      label: 'Critical Bins',
      value: kpis.criticalBins.toString(),
      sub: 'Needs Attention',
      icon: AlertTriangle,
      color: 'var(--accent-red)',
      trend: 'alert' as const,
    },
    {
      label: 'Active Trucks',
      value: `${kpis.activeTrucks} / ${kpis.totalTrucks}`,
      sub: `${Math.round((kpis.activeTrucks / kpis.totalTrucks) * 100)}% active`,
      icon: Truck,
      color: 'var(--accent-emerald)',
      trend: 'neutral' as const,
    },
    {
      label: 'Collection Efficiency',
      value: `${kpis.collectionEfficiency}%`,
      sub: '+8.4%',
      icon: TrendingUp,
      color: 'var(--accent-purple)',
      trend: 'up' as const,
    },
    {
      label: 'Route Saving',
      value: `${kpis.routeSaving} km`,
      sub: 'vs fixed route',
      icon: MapPin,
      color: 'var(--accent-amber)',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="kpi-row">
      {cards.map((card) => (
        <div key={card.label} className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">{card.label}</span>
            <div className="kpi-icon" style={{ color: card.color, background: `${card.color}15` }}>
              <card.icon size={16} />
            </div>
          </div>
          <div className="kpi-value">{card.value}</div>
          <div className={`kpi-sub ${card.trend === 'alert' ? 'kpi-sub-alert' : card.trend === 'up' ? 'kpi-sub-up' : ''}`}>
            {card.sub}
          </div>
          <div className="kpi-simulation-tag">Simulation</div>
        </div>
      ))}
    </div>
  );
}
