// ==========================================
// WasteWiseAI — Core Type Definitions
// ==========================================

export type BinPriority = 'critical' | 'high' | 'medium' | 'normal';
export type TruckStatus = 'on-route' | 'idle' | 'charging' | 'recommended' | 'near-capacity' | 'unavailable';
export type ScenarioType = 'normal' | 'festival' | 'heavy-rain' | 'traffic' | 'truck-unavailable';
export type VehicleType = 'ev' | 'diesel';

export interface Bin {
  id: string;
  location: string;
  lat: number;
  lng: number;
  fillLevel: number;
  fillRate: number; // %/hr
  predictedFill6h: number;
  predictedFill12h: number;
  predictedFill24h: number;
  criticalThreshold: number;
  riskScore: number;
  priority: BinPriority;
  lastCollected: string;
  zoneType: string;
  areaPriority: number; // 1-5
}

export interface Truck {
  id: string;
  name: string;
  type: VehicleType;
  battery: number;
  load: number;
  capacity: number;
  status: TruckStatus;
  lat: number;
  lng: number;
  assignedBins: string[];
  assignedRoute: string | null;
}

export interface RouteRecommendation {
  truckId: string;
  bins: string[];
  estimatedDistance: number;
  estimatedTime: number;
  startLoad: number;
  endLoad: number;
  startBattery: number;
  endBattery: number;
  reasoning: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'critical';
}

export interface Scenario {
  type: ScenarioType;
  label: string;
  description: string;
  fillRateMultiplier: number;
  wasteGenerationIncrease: number;
}

export interface ComparisonMetric {
  metric: string;
  fixed: string;
  optimized: string;
  improvement: string;
}

export interface PredictionPoint {
  hour: number;
  label: string;
  fill: number;
  predicted: number;
  threshold: number;
}

export interface KpiData {
  totalBins: number;
  criticalBins: number;
  activeTrucks: number;
  totalTrucks: number;
  collectionEfficiency: number;
  routeSaving: number;
}
