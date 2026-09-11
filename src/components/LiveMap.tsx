// ==========================================
// WasteWiseAI — Live Map (Leaflet + Light Tiles)
// ==========================================

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bin, Truck, RouteRecommendation } from '../types';
import { getRouteCoordinates } from '../utils/routeOptimization';
import { getTimeToThreshold } from '../utils/riskScoring';
import { formatTruckId, formatTruckShort } from '../utils/truckDisplay';

// Clean up default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LiveMapProps {
  bins: Bin[];
  trucks: Truck[];
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
  onDispatchBin?: (id: string) => void;
  route: RouteRecommendation | null;
  height?: string;
  showLegend?: boolean;
}

function createBinIcon(priority: string, isSelected: boolean): L.DivIcon {
  const colors: Record<string, string> = {
    critical: '#DC2626', // Critical Red
    high: '#F59E0B',     // Warning Amber
    medium: '#0284C7',   // Medium Blue
    normal: '#16A34A',   // Success Green
  };
  const color = colors[priority] || colors.normal;
  const size = isSelected ? 22 : 14;
  const border = isSelected ? '3px solid #17221B' : '2px solid #FFFFFF';
  const shadow = isSelected ? '0 0 14px rgba(23, 107, 58, 0.7)' : '0 2px 5px rgba(0,0,0,0.2)';

  return L.divIcon({
    className: 'custom-bin-icon',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: ${border};
      box-shadow: ${shadow};
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    "></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
}

function createTruckIcon(truck: Truck): L.DivIcon {
  const shortName = formatTruckShort(truck.id);
  const bgColor = truck.status === 'unavailable' ? '#64748B' :
    truck.status === 'recommended' ? '#176B3A' :
    truck.status === 'on-route' ? '#0284C7' :
    truck.status === 'charging' ? '#F59E0B' :
    truck.status === 'near-capacity' ? '#DC2626' :
    '#10B981';

  return L.divIcon({
    className: 'custom-truck-icon',
    html: `<div class="truck-map-pin" style="
      display: flex; align-items: center; justify-content: center;
      background: ${bgColor};
      color: #FFFFFF; font-size: 11px; font-weight: 700;
      width: 28px; height: 28px; border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 3px 8px rgba(0,0,0,0.25);
      cursor: pointer; position: relative;
    ">
      <span>🚛</span>
      <span class="truck-hover-pill">${shortName}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, 14, { duration: 0.8 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

export default function LiveMap({
  bins,
  trucks,
  selectedBinId,
  onSelectBin,
  onDispatchBin,
  route,
  height = '100%',
  showLegend = true,
}: LiveMapProps) {
  const mapCenter: [number, number] = [12.975, 77.593];

  const selectedBin = bins.find(b => b.id === selectedBinId);
  const flyToCenter: [number, number] = selectedBin
    ? [selectedBin.lat, selectedBin.lng]
    : mapCenter;

  // Display only 3-4 collection trucks to avoid map congestion as requested in the audit
  const displayedTrucks = useMemo(() => {
    const routeTruck = route ? trucks.find(t => t.id === route.truckId) : null;
    const activeList = trucks.filter(t => t.status === 'on-route' || t.status === 'recommended');
    const pool = [
      ...(routeTruck ? [routeTruck] : []),
      ...activeList.filter(t => t.id !== routeTruck?.id),
      ...trucks.filter(t => t.status === 'idle'),
    ];

    const seen = new Set<string>();
    const result: Truck[] = [];
    for (const t of pool) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        result.push(t);
        if (result.length >= 4) break;
      }
    }
    return result;
  }, [trucks, route]);

  const routeCoords = route
    ? getRouteCoordinates(
        trucks.find(t => t.id === route.truckId) || trucks[0],
        bins,
        route.bins
      )
    : [];

  return (
    <div className="map-container" style={{ height }}>
      {showLegend && (
        <div className="map-header">
          <div className="map-title-row">
            <span className="map-live-indicator" />
            <h3 className="panel-title">Municipal Live Geospatial Operations</h3>
          </div>
          <div className="map-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#16A34A' }} />Normal</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#F59E0B' }} />High</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#DC2626' }} />Critical</span>
            <span className="legend-item"><span className="legend-dot legend-dot-truck" style={{ background: '#0284C7' }} />Fleet (4 Active)</span>
            {route && (
              <span className="legend-item">
                <span className="legend-line" style={{ background: '#176B3A' }} />
                AI Dispatch Route
              </span>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={14}
        className="leaflet-map"
        zoomControl={false}
      >
        {/* OpenStreetMap Standard Tiles — No API Key Required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapUpdater center={flyToCenter} />

        {/* Bin markers */}
        {bins.map(bin => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={createBinIcon(bin.priority, bin.id === selectedBinId)}
            eventHandlers={{
              click: () => onSelectBin(bin.id),
            }}
          >
            <Popup className="bin-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <strong>{bin.id}</strong>
                  <span className={`priority-badge priority-${bin.priority}`}>{bin.priority.toUpperCase()}</span>
                </div>
                <div className="popup-location">{bin.location} • {bin.zoneType} District</div>
                <div className="popup-grid">
                  <div className="popup-stat">
                    <span className="popup-stat-label">Current Fill</span>
                    <span className="popup-stat-value">{bin.fillLevel}%</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Rate</span>
                    <span className="popup-stat-value">+{bin.fillRate}%/h</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Risk Index</span>
                    <span className="popup-stat-value">{bin.riskScore}/100</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">ETA Critical</span>
                    <span className="popup-stat-value">{getTimeToThreshold(bin)}h</span>
                  </div>
                </div>

                <div className="popup-btn-row" style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {onDispatchBin && (
                    <button
                      className="popup-action-btn"
                      onClick={() => onDispatchBin(bin.id)}
                      style={{ background: '#176B3A', color: '#FFFFFF', flex: 1 }}
                    >
                      ⚡ Quick Dispatch
                    </button>
                  )}
                  <button
                    className="popup-action-btn"
                    onClick={() => onSelectBin(bin.id)}
                    style={{ background: '#F1F5F9', color: '#334155', flex: 1 }}
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected 3-4 collection trucks on map with non-overlapping hover pins */}
        {displayedTrucks.map(truck => (
          <Marker
            key={truck.id}
            position={[truck.lat, truck.lng]}
            icon={createTruckIcon(truck)}
          >
            <Popup className="bin-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <strong>{formatTruckId(truck.id)}</strong>
                  <span className={`status-badge status-${truck.status}`}>{truck.status.toUpperCase()}</span>
                </div>
                <div className="popup-location">
                  Municipal Collection Unit • {formatTruckId(truck.id)}
                </div>
                <div className="popup-grid">
                  <div className="popup-stat">
                    <span className="popup-stat-label">Energy / Fuel Reserve</span>
                    <span className="popup-stat-value">{truck.battery}%</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Current Load</span>
                    <span className="popup-stat-value">{truck.load}%</span>
                  </div>
                </div>
                {truck.assignedRoute && (
                  <div className="popup-route-tag">Assigned Route: {truck.assignedRoute}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline in deep forest green */}
        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#176B3A',
              weight: 5,
              opacity: 0.95,
              dashArray: '8, 6',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
