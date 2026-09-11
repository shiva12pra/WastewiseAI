// ==========================================
// WasteWiseAI — Route Optimization View
// ==========================================

import { useState } from 'react';
import {
  Route as RouteIcon,
  Play,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Battery,
  Package,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { RouteRecommendation, Truck as TruckType, Bin } from '../types';

interface RouteOptimizationViewProps {
  route: RouteRecommendation | null;
  routeApproved: boolean;
  bins: Bin[];
  trucks: TruckType[];
  onGenerateRoute: () => void;
  onApprove: () => void;
  onReject: () => void;
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
}

export default function RouteOptimizationView({
  route,
  routeApproved,
  bins,
  trucks,
  onGenerateRoute,
  onApprove,
  onReject,
  selectedBinId,
  onSelectBin,
}: RouteOptimizationViewProps) {
  const routeTruck = route ? trucks.find(t => t.id === route.truckId) || trucks[0] : null;

  return (
    <div className="routes-view">
      {/* Route Control Top Banner */}
      <div className="route-optimizer-banner">
        <div className="optimizer-banner-left">
          <div className="optimizer-icon-badge">
            <RouteIcon size={20} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="optimizer-title">Demand-Driven Route Optimization Engine</h2>
            <p className="optimizer-subtitle">
              Calculates dynamic multi-stop pickup paths serving high-risk overflowing bins with minimal battery drain.
            </p>
          </div>
        </div>

        <div className="optimizer-banner-actions">
          <button
            className="btn-generate-route"
            onClick={onGenerateRoute}
            id="generate-route-main-btn"
          >
            <Play size={16} /> GENERATE OPTIMIZED ROUTE
          </button>
        </div>
      </div>

      {/* Main Grid: Left Route Summary & Controls, Right Map Preview */}
      <div className="routes-main-grid">
        {/* Left Column: Route Details & Stops Sequence */}
        <div className="routes-left-col">
          {route ? (
            <>
              {/* Route Summary Card */}
              <div className="panel route-summary-panel">
                <div className="panel-header">
                  <div className="panel-header-left">
                    <Truck size={18} className="text-emerald-700" />
                    <div>
                      <h3 className="panel-title">Recommended Dispatch: {route.truckId}</h3>
                      <span className="panel-subtitle">
                        Municipal Collection Unit ({route.truckId}) •{' '}
                        {routeApproved ? (
                          <strong className="text-emerald-700">Dispatched to Route</strong>
                        ) : (
                          <strong className="text-amber-600">Pending Operator Approval</strong>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge ${routeApproved ? 'status-on-route' : 'status-recommended'}`}>
                    {routeApproved ? 'DISPATCHED' : 'READY TO DISPATCH'}
                  </span>
                </div>

                {/* Key Route Metrics Grid */}
                <div className="route-stats-4col">
                  <div className="route-stat-box">
                    <span className="stat-label">
                      <MapPin size={13} /> Route Distance
                    </span>
                    <span className="stat-val">{route.estimatedDistance} km</span>
                    <span className="stat-sub text-emerald-700">-28% vs fixed schedule</span>
                  </div>

                  <div className="route-stat-box">
                    <span className="stat-label">
                      <Clock size={13} /> Est. Time
                    </span>
                    <span className="stat-val">{route.estimatedTime} min</span>
                    <span className="stat-sub">Includes load intervals</span>
                  </div>

                  <div className="route-stat-box">
                    <span className="stat-label">
                      <Battery size={13} /> Energy Consumption
                    </span>
                    <span className="stat-val">
                      {route.startBattery}% → {route.endBattery}%
                    </span>
                    <span className="stat-sub text-emerald-700">~{route.startBattery - route.endBattery}% energy used</span>
                  </div>

                  <div className="route-stat-box">
                    <span className="stat-label">
                      <Package size={13} /> Truck Load
                    </span>
                    <span className="stat-val">
                      {route.startLoad}% → {route.endLoad}%
                    </span>
                    <span className="stat-sub">
                      {route.endLoad <= 90 ? 'Safe capacity window' : 'Near capacity'}
                    </span>
                  </div>
                </div>

                {/* "Why This Route?" AI Explanation Card */}
                <div className="route-why-card">
                  <div className="why-header">
                    <Sparkles size={15} className="text-emerald-700" />
                    <span className="why-title">Why this route?</span>
                  </div>
                  <p className="why-body">
                    {route.reasoning ||
                      `Serves ${route.bins.length} high-risk bins across high-density zones while avoiding an additional redundant collection trip, saving an estimated 18.4 kWh equivalent of vehicle energy.`}
                  </p>
                </div>

                {/* Dispatch / Approval Buttons */}
                <div className="route-actions-bar">
                  {!routeApproved ? (
                    <>
                      <button className="btn-approve-dispatch" onClick={onApprove}>
                        <CheckCircle2 size={16} /> APPROVE & DISPATCH {route.truckId}
                      </button>
                      <button className="btn-reject-route" onClick={onReject}>
                        <XCircle size={16} /> Reject Route
                      </button>
                    </>
                  ) : (
                    <div className="route-dispatched-confirmation">
                      <ShieldCheck size={18} className="text-emerald-700" />
                      <span>
                        Vehicle <strong>{route.truckId}</strong> is officially dispatched. Telemetry tracking active.
                      </span>
                      <button className="btn-secondary-reset ml-auto" onClick={onReject}>
                        <RotateCcw size={14} /> Re-plan Route
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stops Sequence Timeline */}
              <div className="panel route-stops-panel">
                <div className="panel-header">
                  <div className="panel-header-left">
                    <RouteIcon size={16} className="text-emerald-700" />
                    <h3 className="panel-title">Planned Collection Sequence</h3>
                  </div>
                  <span className="panel-count">{route.bins.length} Selected Bins</span>
                </div>

                <div className="stops-timeline">
                  {/* Depot Start */}
                  <div className="timeline-stop start">
                    <div className="stop-marker start">DEPOT</div>
                    <div className="stop-details">
                      <div className="stop-name">Central Municipal Sanitation Depot</div>
                      <div className="stop-sub">Departure with vehicle load at {route.startLoad}% • Energy Level {route.startBattery}%</div>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  {route.bins.map((binId, idx) => {
                    const bin = bins.find(b => b.id === binId);
                    return (
                      <div
                        key={binId}
                        className={`timeline-stop ${selectedBinId === binId ? 'selected-stop' : ''}`}
                        onClick={() => onSelectBin(binId)}
                      >
                        <div className="stop-marker num">{idx + 1}</div>
                        <div className="stop-details">
                          <div className="stop-header-row">
                            <span className="stop-id">{binId}</span>
                            <span className={`priority-badge priority-${bin?.priority || 'high'}`}>
                              {bin?.priority.toUpperCase()}
                            </span>
                            <span className="stop-fill-badge">{bin?.fillLevel}% Fill</span>
                          </div>
                          <div className="stop-name">{bin?.location}</div>
                          <div className="stop-sub capitalize">
                            {bin?.zoneType} zone • Rate: +{bin?.fillRate}%/h • Est. collection volume: ~320 kg
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Depot Return */}
                  <div className="timeline-stop end">
                    <div className="stop-marker end">RETURN</div>
                    <div className="stop-details">
                      <div className="stop-name">Disposal Hub & Fleet Logistics Depot</div>
                      <div className="stop-sub">Estimated final load: {route.endLoad}% • Final energy reserve: {route.endBattery}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State Prompting Generation */
            <div className="panel route-empty-state-panel">
              <div className="empty-state-icon">
                <RouteIcon size={40} className="text-emerald-600" />
              </div>
              <h3 className="empty-state-title">No Active Optimized Route</h3>
              <p className="empty-state-desc">
                Click <strong>"Generate Optimized Route"</strong> to trigger the multi-objective routing algorithm. The system evaluates real-time fill rates, vehicle capacities, and battery levels to recommend the most urgent pickup sequence.
              </p>
              <button className="btn-generate-route large" onClick={onGenerateRoute}>
                <Play size={16} /> GENERATE OPTIMIZED ROUTE
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Route Geospatial Preview */}
        <div className="routes-right-col">
          <div className="panel route-map-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <MapPin size={16} className="text-emerald-700" />
                <h3 className="panel-title">Geospatial Route Trajectory</h3>
              </div>
              {route && (
                <span className="route-tag-pill">
                  {route.bins.length} stops • {route.estimatedDistance} km
                </span>
              )}
            </div>
            <div className="route-map-wrapper">
              <LiveMap
                bins={bins}
                trucks={trucks}
                selectedBinId={selectedBinId}
                onSelectBin={onSelectBin}
                route={route}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
