
import { API_BASE_URL } from '../constants';
import { PlateRecord, FaceProfile, FaceEvent } from '../types';

/**
 * Robust fetch wrapper with exponential backoff retry logic.
 * Ensures high availability even during network jitters.
 */
const fetchWithRetry = async <T>(
  endpoint: string, 
  retries = 3, 
  delay = 500
): Promise<T> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500); // 2.5s Strict Timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(id);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed for ${endpoint}. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(endpoint, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

// --- ALPR API ---
export const getRealPlates = async (): Promise<PlateRecord[]> => {
  const data = await fetchWithRetry<PlateRecord[]>('/lpr');
  return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
};

// --- Face Recognition API ---
export const getRealFaceProfiles = async (): Promise<FaceProfile[]> => {
  const data = await fetchWithRetry<FaceProfile[]>('/faces/profiles');
  return data.map(d => ({ ...d, lastSeen: new Date(d.lastSeen) }));
};

export const getRealFaceEvents = async (): Promise<FaceEvent[]> => {
  const data = await fetchWithRetry<FaceEvent[]>('/faces/events');
  return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
};

// --- Traffic Analytics (WebSocket Helper) ---
export const connectTrafficWebSocket = (onMessage: (data: any) => void) => {
  // Replace http with ws for the socket url
  const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/traffic';
  
  let ws: WebSocket | null = null;
  let reconnectInterval: any = null;
  
  const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Connected to Real Traffic Analytics Stream');
          if (reconnectInterval) clearInterval(reconnectInterval);
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
          // Silent fail for demo
        };

        ws.onclose = () => {
          console.debug("Traffic WebSocket Disconnected. Attempting Reconnect...");
          // Simple reconnection logic
          if (!reconnectInterval) {
              reconnectInterval = setInterval(connect, 5000);
          }
        };

      } catch (e) {
        console.debug('Could not connect to WebSocket', e);
      }
  };

  connect();

  return {
      close: () => {
          if (ws) ws.close();
          if (reconnectInterval) clearInterval(reconnectInterval);
      }
  };
};
