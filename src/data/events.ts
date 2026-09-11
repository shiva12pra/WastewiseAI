// ==========================================
// WasteWiseAI — Mock Data: Events Feed
// ==========================================

import { EventLog } from '../types';

export const initialEvents: EventLog[] = [
  { id: 'evt-1', timestamp: '10:41 AM', message: 'BIN-104 crossed critical threshold (91%)', type: 'critical' },
  { id: 'evt-2', timestamp: '10:43 AM', message: 'AI predicted overflow risk for BIN-221 within 2h', type: 'warning' },
  { id: 'evt-3', timestamp: '10:44 AM', message: 'BIN-317 fill rate accelerating — designated high priority', type: 'warning' },
  { id: 'evt-4', timestamp: '10:45 AM', message: 'Truck 01 completed Route A collection (4 bins)', type: 'success' },
  { id: 'evt-5', timestamp: '10:46 AM', message: 'Truck 11 completed morning shift — returned to depot', type: 'info' },
  { id: 'evt-6', timestamp: '10:47 AM', message: 'System health check — all 32 ultrasonic sensors online', type: 'info' },
  { id: 'evt-7', timestamp: '10:48 AM', message: 'BIN-428 fill rate accelerating (+3.2%/hr)', type: 'warning' },
  { id: 'evt-8', timestamp: '10:50 AM', message: 'Truck 07 assigned Route D — 2 bins scheduled', type: 'info' },
];
