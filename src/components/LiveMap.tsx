// ==========================================
// WasteWiseAI — Live Map (Leaflet + Light Tiles)
// ==========================================

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bin, Truck, RouteRecommendation } from '../types';
import { getRouteCoordinates } from '../utils/routeOptimization';
import { getTimeToThreshold } from '../utils/riskScoring';

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
  route: RouteRecommendation | null;
  height?: string;
  showLegend?: boolean;
}

function createBinIcon(priority: string, isSelected: boolean, fillLevel: number): L.DivIcon {
  const colors: Record<string, string> = {
    critical: '#DC2626', // Critical Red
    high: '#F59E0B',     // Warning Amber
    medium: '#0284C7',   // Medium Blue
    normal: '#16A34A',   // Success Green
  };
  const color = colors[priority] || colors.normal;
  const size = isSelected ? 20 : 14;
  const border = isSelected ? '3px solid #17221B' : '2px solid #FFFFFF';
  const shadow = isSelected ? '0 0 12px rgba(23, 107, 58, 0.6)' : '0 2px 5px rgba(0,0,0,0.2)';

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
  const bgColor = truck.status === 'unavailable' ? '#64748B' :
    truck.status === 'recommended' ? '#176B3A' :
    truck.status === 'on-route' ? '#0284C7' :
    truck.status === 'charging' ? '#F59E0B' :
    truck.status === 'near-capacity' ? '#DC2626' :
    '#10B981';

  return L.divIcon({
    className: 'custom-truck-icon',
    html: `<div style="
      display: flex; align-items: center; justify-content: center; gap: 4px;
      background: ${bgColor};
      color: #FFFFFF; font-size: 10px; font-weight: 700;
      padding: 3px 8px; border-radius: 6px;
      white-space: nowrap;
      border: 2px solid #FFFFFF;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: 0.3px;
    ">🚛 ${truck.id}</div>`,
    iconSize: [74, 24],
    iconAnchor: [37, 12],
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
  route,
  height = '100%',
  showLegend = true,
}: LiveMapProps) {
  const mapCenter: [number, number] = [12.975, 77.593];

  const selectedBin = bins.find(b => b.id === selectedBinId);
  const flyToCenter: [number, number] = selectedBin
    ? [selectedBin.lat, selectedBin.lng]
    : mapCenter;

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
            <span className="legend-item"><span className="legend-dot legend-dot-truck" style={{ background: '#0284C7' }} />Fleet Units</span>
            {route && (
              <span className="legend-item">
                <span className="legend-line" style={{ background: '#176B3A' }} />
                AI Route
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
        attributionControl={false}
      >
        {/* Clean Voyager tiles without attribution / API key watermark */}
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <MapUpdater center={flyToCenter} />

        {/* Bin markers */}
        {bins.map(bin => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={createBinIcon(bin.priority, bin.id === selectedBinId, bin.fillLevel)}
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
                <div className="popup-location">{bin.location} • {bin.zoneType}</div>
                <div className="popup-grid">
                  <div className="popup-stat">
                    <span className="popup-stat-label">Fill</span>
                    <span className="popup-stat-value">{bin.fillLevel}%</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Rate</span>
                    <span className="popup-stat-value">+{bin.fillRate}%/h</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Risk</span>
                    <span className="popup-stat-value">{bin.riskScore}/100</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">ETA Overflow</span>
                    <span className="popup-stat-value">{getTimeToThreshold(bin)}h</span>
                  </div>
                </div>
                <button
                  className="popup-action-btn"
                  onClick={() => onSelectBin(bin.id)}
                >
                  Inspect Telemetry
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Truck markers */}
        {trucks.map(truck => (
          <Marker
            key={truck.id}
            position={[truck.lat, truck.lng]}
            icon={createTruckIcon(truck)}
          >
            <Popup className="bin-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <strong>{truck.id} ({truck.name})</strong>
                  <span className={`status-badge status-${truck.status}`}>{truck.status.toUpperCase()}</span>
                </div>
                <div className="popup-location">
                  Municipal Collection Vehicle • {truck.id}
                </div>
                <div className="popup-grid">
                  <div className="popup-stat">
                    <span className="popup-stat-label">Energy Level</span>
                    <span className="popup-stat-value">{truck.battery}%</span>
                  </div>
                  <div className="popup-stat">
                    <span className="popup-stat-label">Current Load</span>
                    <span className="popup-stat-value">{truck.load}%</span>
                  </div>
                </div>
                {truck.assignedRoute && (
                  <div className="popup-route-tag">Assigned: {truck.assignedRoute}</div>
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
              opacity: 0.9,
              dashArray: '8, 6',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
