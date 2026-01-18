
import { GeoCamera, GeoEvent, GeoZone, DetectionType, SuspectToken, PursuitUpdate } from '../types';
import { MOCK_CAMERAS } from '../constants';

export const getGeoCameras = (): GeoCamera[] => {
    return MOCK_CAMERAS.map((c, i) => ({
        ...c,
        geo: { 
            lat: 13.7563 + (Math.random() - 0.5) * 0.01, 
            lng: 100.5018 + (Math.random() - 0.5) * 0.01,
            fovRadius: 100,
            heading: (i * 90) % 360
        }
    }));
};

export const getGeoZones = (): GeoZone[] => {
    return [
        {
            id: 'zone-1',
            name: 'Restricted Area',
            points: [
                { lat: 13.7563, lng: 100.5018 },
                { lat: 13.7573, lng: 100.5018 },
                { lat: 13.7573, lng: 100.5028 },
                { lat: 13.7563, lng: 100.5028 }
            ],
            type: 'RESTRICTED'
        }
    ];
};

export const generateLiveGeoEvents = (count: number): GeoEvent[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `geo-evt-${Date.now()}-${i}`,
        timestamp: new Date(),
        type: Math.random() > 0.5 ? 'PERSON' : 'VEHICLE',
        description: Math.random() > 0.5 ? 'Suspicious movement in zone' : 'Unauthorized vehicle detected',
        location: { 
            lat: 13.7563 + (Math.random() - 0.5) * 0.005, 
            lng: 100.5018 + (Math.random() - 0.5) * 0.005 
        },
        severity: Math.random() > 0.8 ? 'CRITICAL' : 'MEDIUM'
    }));
};

// --- PURSUIT SIMULATION ---

// Mock Topology: Cam 1 -> Cam 2 -> Cam 3 -> Cam 4
const PURSUIT_PATH = ['cam-001', 'cam-002', 'cam-003', 'cam-004'];

export const createMockSuspectToken = (): SuspectToken => {
  return {
    tokenId: `suspect-${Math.floor(Math.random() * 1000)}`,
    status: 'ACTIVE',
    startTime: new Date(),
    lastSeenTime: new Date(),
    lastCameraId: PURSUIT_PATH[0],
    predictedNextCameras: [PURSUIT_PATH[1]],
    attributes: {
      upperColor: 'Red',
      lowerColor: 'Black',
      type: 'Person'
    },
    timeline: [
      {
        id: 'step-1',
        timestamp: new Date(),
        cameraId: PURSUIT_PATH[0],
        cameraName: MOCK_CAMERAS.find(c => c.id === PURSUIT_PATH[0])?.name || 'Unknown',
        action: 'ENTER',
        confidence: 0.98,
        snapshotUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200'
      }
    ]
  };
};

export const simulateNextPursuitStep = (currentToken: SuspectToken): SuspectToken | null => {
  const currentIndex = PURSUIT_PATH.indexOf(currentToken.lastCameraId);
  
  // End of path or random stop
  if (currentIndex === -1 || currentIndex >= PURSUIT_PATH.length - 1) return null;

  const nextCamId = PURSUIT_PATH[currentIndex + 1];
  const nextCam = MOCK_CAMERAS.find(c => c.id === nextCamId);
  
  if (!nextCam) return null;

  const newStep: PursuitUpdate = {
    id: `step-${Date.now()}`,
    timestamp: new Date(),
    cameraId: nextCamId,
    cameraName: nextCam.name,
    action: 'ACQUIRED' as any,
    confidence: 0.85 + (Math.random() * 0.1),
    snapshotUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200' // Reuse for consistency in mock
  };

  return {
    ...currentToken,
    lastSeenTime: new Date(),
    lastCameraId: nextCamId,
    predictedNextCameras: currentIndex + 2 < PURSUIT_PATH.length ? [PURSUIT_PATH[currentIndex + 2]] : [],
    timeline: [newStep, ...currentToken.timeline] // Newest first
  };
};
