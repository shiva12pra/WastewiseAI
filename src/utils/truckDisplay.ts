// ==========================================
// WasteWiseAI — Vehicle-Neutral Display Utility
// ==========================================

import { Truck, VehicleType } from '../types';

const truckNameMap: Record<string, string> = {
  'EV-01': 'Truck 01',
  'EV-02': 'Truck 02',
  'EV-03': 'Truck 03',
  'EV-04': 'Truck 04',
  'EV-05': 'Truck 05',
  'EV-06': 'Truck 06',
  'DV-01': 'Truck 07',
  'DV-02': 'Truck 08',
  'DV-03': 'Truck 09',
  'EV-07': 'Truck 10',
  'EV-08': 'Truck 11',
  'DV-04': 'Truck 12',
};

const truckShortMap: Record<string, string> = {
  'EV-01': 'T-01',
  'EV-02': 'T-02',
  'EV-03': 'T-03',
  'EV-04': 'T-04',
  'EV-05': 'T-05',
  'EV-06': 'T-06',
  'DV-01': 'T-07',
  'DV-02': 'T-08',
  'DV-03': 'T-09',
  'EV-07': 'T-10',
  'EV-08': 'T-11',
  'DV-04': 'T-12',
};

/**
 * Converts internal IDs (e.g. EV-01, DV-01) to professional municipal names
 */
export function formatTruckId(id: string): string {
  if (truckNameMap[id]) return truckNameMap[id];
  return id.replace('EV-', 'Truck ').replace('DV-', 'Truck ');
}

/**
 * Short label for compact tags and map pins
 */
export function formatTruckShort(id: string): string {
  if (truckShortMap[id]) return truckShortMap[id];
  return id.replace('EV-', 'T-').replace('DV-', 'T-');
}

/**
 * Municipal vehicle model class
 */
export function getTruckModelName(truck: Truck | { type?: VehicleType }): string {
  return truck.type === 'ev' ? 'Municipal Compactor T-8' : 'Standard Urban Carrier C-4';
}

/**
 * Fleet category descriptor
 */
export function getFleetCategoryLabel(type: VehicleType): string {
  return type === 'ev' ? 'High-Efficiency Electric Fleet' : 'Standard Heavy-Duty Fleet';
}
