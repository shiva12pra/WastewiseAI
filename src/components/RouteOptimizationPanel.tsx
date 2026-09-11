// ==========================================
// WasteWiseAI — Route Optimization Panel
// ==========================================

import { Route as RouteIcon, Play, MapPin, Clock, Battery, Package, Lightbulb, Info } from 'lucide-react';
import { RouteRecommendation, Truck, Bin } from '../types';
import { formatTruckId } from '../utils/truckDisplay';

interface RouteOptimizationPanelProps {
  route: RouteRecommendation | null;
  routeApproved: boolean;
  bins: Bin[];
  trucks: Truck[];
  onGenerateRoute: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function RouteOptimizationPanel({
  route, routeApproved, bins, trucks,
  onGenerateRoute, onApprove, onReject,
}: RouteOptimizationPanelProps) {
  const routeTruck = route ? trucks.find(t => t.id === route.truckId) : null;
  const truckDisplayName = route ? formatTruckId(route.truckId) : '';

  return (
    <div className="panel route-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <RouteIcon size={16} className="panel-header-icon text-emerald-700" />
          <h3 className="panel-title">Dynamic Route Optimization</h3>
        </div>
      </div>

      <button className="generate-route-btn" onClick={onGenerateRoute}>
        <Play size={14} />
        Generate Optimized Routes
      </button>

      {route && (
        <div className="route-result">
          <div className="route-truck-header">
            <span className="route-truck-label">Assigned Vehicle</span>
            <span className="route-truck-id">{truckDisplayName}</span>
          </div>

          <div className="route-stops">
            <span className="route-stops-label">Pickup Sequence:</span>
            {route.bins.map((binId, i) => {
              const bin = bins.find(b => b.id === binId);
              return (
                <div key={binId} className="route-stop">
                  <span className="route-stop-dot" />
                  <span className="route-stop-id">{binId}</span>
                  <span className="route-stop-loc">{bin?.location}</span>
                  {i < route.bins.length - 1 && <span className="route-stop-line" />}
                </div>
              );
            })}
          </div>

          <div className="route-stats-grid">
            <div className="route-stat">
              <MapPin size={13} className="text-emerald-700" />
              <div>
                <span className="route-stat-label">Distance</span>
                <span className="route-stat-value">{route.estimatedDistance} km</span>
              </div>
            </div>
            <div className="route-stat">
              <Clock size={13} className="text-blue-600" />
              <div>
                <span className="route-stat-label">Est. Time</span>
                <span className="route-stat-value">{route.estimatedTime} min</span>
              </div>
            </div>
            <div className="route-stat">
              <Package size={13} className="text-amber-600" />
              <div>
                <span className="route-stat-label">Truck Load</span>
                <span className="route-stat-value">{route.startLoad}% → {route.endLoad}%</span>
              </div>
            </div>
            <div className="route-stat">
              <Battery size={13} className="text-emerald-700" />
              <div>
                <span className="route-stat-label">Energy Reserve</span>
                <span className="route-stat-value">{route.startBattery}% → {route.endBattery}%</span>
              </div>
            </div>
          </div>

          <div className="route-reasoning">
            <Lightbulb size={13} className="text-emerald-700" />
            <span>{route.reasoning}</span>
          </div>

          {/* Operator Control */}
          <div className="operator-section">
            <div className="operator-header">
              <span>Optimization Recommendation</span>
            </div>
            <p className="operator-recommendation">
              Dispatch <strong>{truckDisplayName}</strong> to collect {route.bins.join(', ')}.
            </p>

            {routeApproved ? (
              <div className="route-approved-badge">
                ✓ Route Confirmed — {truckDisplayName} officially dispatched
              </div>
            ) : (
              <div className="operator-buttons">
                <button className="btn-approve" onClick={onApprove}>Accept & Dispatch</button>
                <button className="btn-modify" onClick={onGenerateRoute}>Re-Calculate</button>
                <button className="btn-reject" onClick={onReject}>Reject</button>
              </div>
            )}
          </div>

          <div className="prediction-tag">
            <Info size={12} className="text-secondary" />
            <span>Demand-driven route • Updated in real time</span>
          </div>
        </div>
      )}

      {!route && (
        <div className="panel-empty" style={{ marginTop: '12px' }}>
          <p>Click "Generate" to compute optimal multi-stop route based on live bin priorities and vehicle availability</p>
        </div>
      )}
    </div>
  );
}
