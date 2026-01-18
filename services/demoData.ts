
import { Camera, CameraStatus, DetectionType } from '../types';

export interface DemoScenario {
  cameraId: string;
  videoUrl: string; // URL to a looped mp4
  eventScript: {
    time: number; // Seconds from start
    type: DetectionType;
    message: string;
    duration: number;
  }[];
}

const DEFAULT_SECURITY = {
  encryption: 'AES-128' as const,
  authMethod: 'BASIC' as const,
  firmwareVersion: '1.0.0-demo',
  lastSecurityAudit: new Date(),
  zeroTrustEnabled: false,
  isDefaultCreds: true,
  httpsEnabled: false,
  portExposed: true,
  failedLoginCount: 0
};

const DEFAULT_FORENSICS = {
  watermarkEnabled: false,
  watermarkText: '',
  digitalSignature: false,
  rollingHash: false,
  retentionPolicy: '7_DAYS' as const
};

// Using generic reliable video placeholders for demo purposes
// In production, these would be specific staged scenarios hosted on a CDN
export const DEMO_CAMERAS: Camera[] = [
  {
    id: 'demo-home',
    name: 'Home Garage (Intrusion)',
    location: 'Residential Zone',
    status: CameraStatus.RECORDING,
    url: 'https://media.istockphoto.com/id/1346563635/video/cctv-camera-monitor-in-the-office-building.mp4?s=mp4-640x640-is&k=20&c=K5f22L6iFkXqT-dC6l6Xq5Z8X5Z8X5Z8X5Z8X5Z8X5Z8=', // Placeholder
    features: ['Intrusion', 'Person'],
    ipAddress: '192.168.1.101',
    macAddress: '00:11:22:33:44:55',
    streamType: 'HLS',
    security: DEFAULT_SECURITY,
    forensics: DEFAULT_FORENSICS,
    privacyMasks: [],
    activeModels: [{ modelId: 'intrusion-v1', confidenceThreshold: 0.8, enabled: true }]
  },
  {
    id: 'demo-shop',
    name: 'Retail Aisle (Loitering)',
    location: 'Mega Mall Bangna',
    status: CameraStatus.RECORDING,
    url: 'https://media.istockphoto.com/id/1142243454/video/cctv-camera-monitor-in-supermarket.mp4?s=mp4-640x640-is&k=20&c=X2y_X2y_X2y_X2y_X2y_X2y_X2y_X2y_X2y_X2y_=', // Placeholder
    features: ['Loitering', 'Face'],
    ipAddress: '10.0.0.50',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    streamType: 'RTSP',
    security: { 
      ...DEFAULT_SECURITY, 
      encryption: 'AES-256-GCM', 
      zeroTrustEnabled: true,
      httpsEnabled: true,
      isDefaultCreds: false,
      portExposed: false 
    },
    forensics: { ...DEFAULT_FORENSICS, watermarkEnabled: true, watermarkText: 'STORE-EVIDENCE' },
    privacyMasks: [],
    activeModels: [{ modelId: 'loitering-v2', confidenceThreshold: 0.75, enabled: true }]
  },
  {
    id: 'demo-street',
    name: 'Main Junction (Traffic)',
    location: 'Sukhumvit Rd.',
    status: CameraStatus.RECORDING,
    url: 'https://media.istockphoto.com/id/1189304324/video/traffic-cctv-camera.mp4?s=mp4-640x640-is&k=20&c=ABC_ABC_ABC_ABC_ABC_ABC_ABC_ABC_ABC_ABC_=', // Placeholder
    features: ['Wrong Way', 'ALPR'],
    ipAddress: '172.16.10.20',
    macAddress: '12:34:56:78:90:AB',
    streamType: 'RTSP', // Changed from WEBRTC to RTSP to avoid connection errors
    security: DEFAULT_SECURITY,
    forensics: DEFAULT_FORENSICS,
    privacyMasks: [],
    activeModels: [{ modelId: 'alpr-pro', confidenceThreshold: 0.9, enabled: true }]
  },
  {
    id: 'demo-factory',
    name: 'Factory Line A (Safety)',
    location: 'Industrial Estate',
    status: CameraStatus.RECORDING,
    url: 'https://media.istockphoto.com/id/1284066236/video/automated-machine-in-factory.mp4?s=mp4-640x640-is&k=20&c=DEF_DEF_DEF_DEF_DEF_DEF_DEF_DEF_DEF_DEF_=', // Placeholder
    features: ['Fall', 'PPE'],
    ipAddress: '192.168.100.15',
    macAddress: 'FE:DC:BA:98:76:54',
    streamType: 'RTSP',
    security: { 
      ...DEFAULT_SECURITY, 
      authMethod: 'MTLS_CERT',
      isDefaultCreds: false,
      httpsEnabled: true 
    },
    forensics: DEFAULT_FORENSICS,
    privacyMasks: [],
    activeModels: [{ modelId: 'ppe-safety', confidenceThreshold: 0.85, enabled: true }]
  }
];

export const DEMO_EVENTS = [
  {
    cameraId: 'demo-home',
    triggerTime: 5,
    type: DetectionType.INTRUSION,
    message: '⚠️ Intrusion Detected: Person crossed virtual fence at Garage',
    severity: 'HIGH'
  },
  {
    cameraId: 'demo-factory',
    triggerTime: 12,
    type: DetectionType.FALL,
    message: '🆘 Fall Detected: Worker down in Assembly Line A',
    severity: 'CRITICAL'
  },
  {
    cameraId: 'demo-shop',
    triggerTime: 20,
    type: DetectionType.ANOMALY,
    message: 'Suspicious Loitering: Person in Aisle 4 > 60s',
    severity: 'MEDIUM'
  }
];
