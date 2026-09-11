// ==========================================
// WasteWiseAI — Mock Data: Scenarios
// ==========================================

import { Scenario } from '../types';

export const scenariosData: Scenario[] = [
  {
    type: 'normal',
    label: 'Normal Day',
    description: 'Standard baseline municipal waste generation patterns across all city zones.',
    fillRateMultiplier: 1.0,
    wasteGenerationIncrease: 0,
  },
  {
    type: 'festival',
    label: 'Festival / High Waste',
    description: 'High waste surge in commercial zones, markets, and public squares (+45% waste).',
    fillRateMultiplier: 1.85,
    wasteGenerationIncrease: 45,
  },
  {
    type: 'heavy-rain',
    label: 'Heavy Rain',
    description: 'Reduced vehicle speeds and waterlogged road segments (+20% waste weight factor).',
    fillRateMultiplier: 1.35,
    wasteGenerationIncrease: 20,
  },
  {
    type: 'traffic',
    label: 'Traffic Increase',
    description: 'Significant arterial traffic congestion (+35% travel time; dynamic re-routing).',
    fillRateMultiplier: 1.15,
    wasteGenerationIncrease: 10,
  },
  {
    type: 'truck-unavailable',
    label: 'Truck Unavailable',
    description: 'Primary vehicle EV-02 is down for depot maintenance — automated failover.',
    fillRateMultiplier: 1.0,
    wasteGenerationIncrease: 0,
  },
];
