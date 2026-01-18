
import { API_BASE_URL } from '../constants';
import { PlateRecord, FaceProfile, FaceEvent } from '../types';
import { generateMockPlates, generateMockFaceProfiles, generateMockFaceEvents } from './mockAiService';

// --- PRODUCTION MODE: HYBRID FETCH ---
// Tries to fetch from real API, falls back to Mock Generators if offline/unreachable
const fetchReal = async <T>(endpoint: string, fallbackFactory: () => T): Promise<T> => {
  try {
    // Add a short timeout to fail fast if backend is not running
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for snappy UI

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('visionguard_token')}`
      }
    });
    
    clearTimeout(id);

    if (!response.ok) {
      console.debug(`API Error ${response.status} at ${endpoint}: Using simulation data.`);
      return fallbackFactory();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Suppress severe error logging for cleaner demo experience
    console.debug(`[Offline Mode] Could not connect to ${endpoint}. Using simulation data.`);
    return fallbackFactory(); 
  }
};

// --- ALPR API ---
export const getRealPlates = async (): Promise<PlateRecord[]> => {
  const data = await fetchReal<PlateRecord[]>('/lpr', () => generateMockPlates(20));
  // Ensure dates are parsed correctly whether from API (string) or Mock (Date)
  return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
};

// --- Face Recognition API ---
export const getRealFaceProfiles = async (): Promise<FaceProfile[]> => {
  const data = await fetchReal<FaceProfile[]>('/faces/profiles', () => generateMockFaceProfiles(12));
  return data.map(d => ({ ...d, lastSeen: new Date(d.lastSeen) }));
};

export const getRealFaceEvents = async (): Promise<FaceEvent[]> => {
  const data = await fetchReal<FaceEvent[]>('/faces/events', () => generateMockFaceEvents(15));
  return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
};

// --- Traffic Analytics (WebSocket Helper) ---
export const connectTrafficWebSocket = (onMessage: (data: any) => void) => {
  // Replace http with ws for the socket url
  const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/traffic';
  
  let ws: WebSocket | null = null;
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to Real Traffic Analytics Stream');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    ws.onerror = (event) => {
      // Silent fail for demo - prevents console spam if backend is off
      // console.warn("Traffic WebSocket connection failed.");
    };

    ws.onclose = () => {
      console.debug("Traffic WebSocket Disconnected");
    };

  } catch (e) {
    console.debug('Could not connect to WebSocket', e);
  }

  return ws;
};
