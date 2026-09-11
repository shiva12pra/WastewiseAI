// ==========================================
// WasteWiseAI — Mock Data: Events Feed
// ==========================================

import { EventLog } from '../types';

export const initialEvents: EventLog[] = [
  { id: 'evt-1', timestamp: '10:41 AM', message: 'BIN-104 crossed critical threshold (91%)', type: 'critical' },
  { id: 'evt-2', timestamp: '10:43 AM', message: 'AI predicted overflow risk for BIN-221 within 2h', type: 'warning' },
  { id: 'evt-3', timestamp: '10:44 AM', message: 'BIN-317 fill rate increasing — predicted high priority', type: 'warning' },
  { id: 'evt-4', timestamp: '10:45 AM', message: 'EV-01 completed Route A collection (4 bins)', type: 'success' },
  { id: 'evt-5', timestamp: '10:46 AM', message: 'EV-08 battery low (15%) — returned for charging', type: 'warning' },
  { id: 'evt-6', timestamp: '10:47 AM', message: 'System health check — all sensors online', type: 'info' },
  { id: 'evt-7', timestamp: '10:48 AM', message: 'BIN-428 fill rate accelerating (+3.2%/hr)', type: 'warning' },
  { id: 'evt-8', timestamp: '10:50 AM', message: 'DV-01 assigned Route D — 2 bins scheduled', type: 'info' },
];
