// ==========================================
// WasteWiseAI — Mock Data: Trucks / Fleet
// ==========================================

import { Truck } from '../types';

export const trucksData: Truck[] = [
  {
    id: 'EV-01', name: 'EV-01', type: 'ev',
    battery: 78, load: 54, capacity: 100,
    status: 'on-route', lat: 12.9745, lng: 77.5935,
    assignedBins: ['BIN-135', 'BIN-248'], assignedRoute: 'Route A'
  },
  {
    id: 'EV-02', name: 'EV-02', type: 'ev',
    battery: 61, load: 71, capacity: 100,
    status: 'idle', lat: 12.9770, lng: 77.5900,
    assignedBins: [], assignedRoute: null
  },
  {
    id: 'EV-03', name: 'EV-03', type: 'ev',
    battery: 92, load: 30, capacity: 100,
    status: 'idle', lat: 12.9800, lng: 77.5870,
    assignedBins: [], assignedRoute: null
  },
  {
    id: 'EV-04', name: 'EV-04', type: 'ev',
    battery: 38, load: 82, capacity: 100,
    status: 'near-capacity', lat: 12.9720, lng: 77.5960,
    assignedBins: ['BIN-701', 'BIN-789'], assignedRoute: 'Route C'
  },
  {
    id: 'EV-05', name: 'EV-05', type: 'ev',
    battery: 85, load: 22, capacity: 100,
    status: 'idle', lat: 12.9830, lng: 77.5940,
    assignedBins: [], assignedRoute: null
  },
  {
    id: 'EV-06', name: 'EV-06', type: 'ev',
    battery: 55, load: 65, capacity: 100,
    status: 'on-route', lat: 12.9680, lng: 77.5890,
    assignedBins: ['BIN-256', 'BIN-371'], assignedRoute: 'Route B'
  },
  {
    id: 'DV-01', name: 'DV-01', type: 'diesel',
    battery: 100, load: 45, capacity: 100,
    status: 'on-route', lat: 12.9760, lng: 77.6020,
    assignedBins: ['BIN-484', 'BIN-599'], assignedRoute: 'Route D'
  },
  {
    id: 'DV-02', name: 'DV-02', type: 'diesel',
    battery: 100, load: 60, capacity: 100,
    status: 'idle', lat: 12.9850, lng: 77.5910,
    assignedBins: [], assignedRoute: null
  },
  {
    id: 'DV-03', name: 'DV-03', type: 'diesel',
    battery: 100, load: 35, capacity: 100,
    status: 'on-route', lat: 12.9650, lng: 77.5860,
    assignedBins: ['BIN-477', 'BIN-822'], assignedRoute: 'Route E'
  },
  {
    id: 'EV-07', name: 'EV-07', type: 'ev',
    battery: 72, load: 48, capacity: 100,
    status: 'on-route', lat: 12.9710, lng: 77.5850,
    assignedBins: ['BIN-618'], assignedRoute: 'Route F'
  },
  {
    id: 'EV-08', name: 'EV-08', type: 'ev',
    battery: 15, load: 88, capacity: 100,
    status: 'charging', lat: 12.9790, lng: 77.5860,
    assignedBins: [], assignedRoute: null
  },
  {
    id: 'DV-04', name: 'DV-04', type: 'diesel',
    battery: 100, load: 20, capacity: 100,
    status: 'idle', lat: 12.9840, lng: 77.5830,
    assignedBins: [], assignedRoute: null
  },
];
