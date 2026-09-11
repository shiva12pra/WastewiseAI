// ==========================================
// WasteWiseAI — Route Optimization Panel
// ==========================================

import { Route as RouteIcon, Play, MapPin, Clock, Battery, Package, Lightbulb, Info } from 'lucide-react';
import { RouteRecommendation, Truck, Bin } from '../types';

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

  return (
    <div className="panel route-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <RouteIcon size={16} className="panel-header-icon purple" />
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
            <span className="route-truck-label">Recommended Route</span>
            <span className="route-truck-id">{route.truckId}</span>
          </div>

          <div className="route-stops">
            <span className="route-stops-label">Stops:</span>
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
              <MapPin size={13} />
              <div>
                <span className="route-stat-label">Distance</span>
                <span className="route-stat-value">{route.estimatedDistance} km</span>
              </div>
            </div>
            <div className="route-stat">
              <Clock size={13} />
              <div>
                <span className="route-stat-label">Est. Time</span>
                <span className="route-stat-value">{route.estimatedTime} min</span>
              </div>
            </div>
            <div className="route-stat">
              <Package size={13} />
              <div>
                <span className="route-stat-label">Capacity</span>
                <span className="route-stat-value">{route.startLoad}% → {route.endLoad}%</span>
              </div>
            </div>
            {routeTruck?.type === 'ev' && (
              <div className="route-stat">
                <Battery size={13} />
                <div>
                  <span className="route-stat-label">Battery</span>
                  <span className="route-stat-value">{route.startBattery}% → {route.endBattery}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="route-reasoning">
            <Lightbulb size={13} />
            <span>{route.reasoning}</span>
          </div>

          {/* Operator Control */}
          <div className="operator-section">
            <div className="operator-header">
              <span>AI Recommendation</span>
            </div>
            <p className="operator-recommendation">
              Dispatch <strong>{route.truckId}</strong> to {route.bins.join(', ')}.
            </p>

            {routeApproved ? (
              <div className="route-approved-badge">
                ✓ Route Approved — {route.truckId} dispatched
              </div>
            ) : (
              <div className="operator-buttons">
                <button className="btn-approve" onClick={onApprove}>Accept Recommendation</button>
                <button className="btn-modify" onClick={onGenerateRoute}>Modify Route</button>
                <button className="btn-reject" onClick={onReject}>Reject</button>
              </div>
            )}
          </div>

          <div className="prediction-tag">
            <Info size={12} />
            <span>Simulated route — demonstration data</span>
          </div>
        </div>
      )}

      {!route && (
        <div className="panel-empty" style={{ marginTop: '12px' }}>
          <p>Click "Generate" to compute optimized routes based on current bin priorities and fleet availability</p>
        </div>
      )}
    </div>
  );
}
