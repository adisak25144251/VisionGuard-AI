
import { 
  DetectionType, LogEntry, PlateRecord, FaceProfile, FaceEvent, 
  RuleConfig, EvidencePack, RetentionPolicy, SecurityIncident, 
  DeviceSecurityScore, AnomalyEvent, AnomalyStats, TamperEvent, 
  CameraHealth, FeatureType, EvidenceManifest, ChainEntry, SearchFilters,
  Camera, SecurityScoreBreakdown, RunbookStep, CameraTelemetry, HealthStatus,
  DailySummaryReport, TimelineEvent, PriorityAction, SmartQueryResult,
  AccessLog, PrivacyConfig, RetentionRule, BehaviorEvent, CameraCalibration, 
  ThresholdProfile, EvidenceAsset, TrajectoryType, FaceCategory,
  SuspectProfile, ProfileType, ProfileAttribute
} from '../types';
import { MOCK_CAMERAS as CONSTANT_CAMERAS } from '../constants';

// ... (Keep Existing Helper Functions & Generators) ...

export const calculatePostureScore = (camera: Camera): SecurityScoreBreakdown => {
  let score = 100;
  const issues: { label: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
  if (camera.security.isDefaultCreds) { score -= 40; issues.push({ label: 'Default Credentials', severity: 'HIGH' }); }
  if (!camera.security.httpsEnabled) { score -= 20; issues.push({ label: 'HTTPS Disabled', severity: 'MEDIUM' }); }
  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'POOR' : 'CRITICAL';
  return { score, status, issues, vulnerabilities: issues.length };
};

export const generateSmartTelemetry = (idx: number): CameraTelemetry => {
  return {
    fps: 24, targetFps: 30, jitterMs: 10, packetLossPct: 0.1, bitrateKbps: 4000,
    resolution: '1080p', reconnectCount: 0, uptimeSeconds: 86400, healthStatus: 'HEALTHY',
    isDegradedMode: false, signalStrength: 80, recommendations: []
  };
};

export const generateChartData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toLocaleDateString('th-TH'),
    vehicles: Math.floor(Math.random() * 500) + 100, people: Math.floor(Math.random() * 300) + 50
  }));
};

export const generateMockLog = (): LogEntry => ({
    id: Math.random().toString(36).substr(2, 9), timestamp: new Date(),
    cameraName: `Camera-${Math.floor(Math.random() * 5)}`, type: 'PERSON',
    details: 'Details...', confidence: 0.9, isAlert: false
});

export const generateMockPlates = (count: number): PlateRecord[] => Array.from({ length: count }, (_, i) => ({
    id: `p-${i}`, plateNumber: '1กข-1234', province: 'BKK', timestamp: new Date(),
    cameraName: 'Gate', imageFull: '', imageCrop: '', vehicleType: 'Sedan',
    vehicleColor: 'Black', confidence: 0.9, isWatchlist: false
}));

export const generateMockFaceProfiles = (count: number): FaceProfile[] => Array.from({ length: count }, (_, i) => ({
    id: `f-${i}`, name: `User ${i}`, category: 'STAFF', notes: '', lastSeen: new Date(), imageUrl: ''
}));

export const generateMockFaceEvents = (count: number): FaceEvent[] => Array.from({ length: count }, (_, i) => ({
    id: `fe-${i}`, name: `User ${i}`, category: 'STAFF', timestamp: new Date(), cameraName: 'Door', confidence: 0.9, imageUrl: ''
}));

export const generateMockRules = (): RuleConfig[] => [
    { id: 'r1', name: 'Rule 1', cameraId: 'c1', cameraName: 'Cam 1', featureType: 'INTRUSION', isActive: true, sensitivity: 80, schedule: 'Always', alerts: [] }
];

// ... (Evidence Generator) ...
const generateChainOfCustody = (timestamp: Date): ChainEntry[] => {
    return [
        { timestamp: timestamp, action: 'GENERATED', actor: 'System (VisionGuard Core)', currHash: Math.random().toString(36).substring(7) },
        { timestamp: new Date(timestamp.getTime() + 60000), action: 'LOCKED', actor: 'System Policy (Auto-Lock)', currHash: Math.random().toString(36).substring(7) },
        { timestamp: new Date(timestamp.getTime() + 3600000), action: 'VIEWED', actor: 'Admin User', currHash: Math.random().toString(36).substring(7) }
    ];
};

export const generateEvidencePacks = (count: number): EvidencePack[] => Array.from({ length: count }, (_, i) => {
    const ts = new Date(Date.now() - i * 86400000);
    const id = `ev-${i}`;
    return {
        id: id,
        packId: `PK-${new Date().getFullYear()}-${1000 + i}`,
        timestamp: ts,
        eventType: i % 2 === 0 ? 'INTRUSION' : 'FALL',
        cameraName: `Camera ${i % 4 + 1}`,
        severity: i % 5 === 0 ? 'CRITICAL' : 'HIGH',
        videoUrl: 'https://media.istockphoto.com/id/1346563635/video/cctv-camera-monitor-in-the-office-building.mp4?s=mp4-640x640-is&k=20&c=K5f22L6iFkXqT-dC6l6Xq5Z8X5Z8X5Z8X5Z8X5Z8X5Z8=',
        snapshots: [`https://picsum.photos/400/225?random=${i}`],
        sizeBytes: 15 * 1024 * 1024, // 15MB
        metadata: {
            confidence: 0.95,
            zoneName: 'Secure Zone A',
            objectCount: 1,
            attributes: { color: ['Red'], direction: 'IN', trackId: `trk-${i}` }
        },
        manifest: {
            version: '1.2.0',
            packId: id,
            integrityHash: 'sha256-' + Math.random().toString(36).substring(2),
            ledger: generateChainOfCustody(ts)
        }
    };
});

export const searchEvidencePacks = (packs: EvidencePack[], filters?: SearchFilters, searchTerm?: string) => {
  let results = packs;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(p => 
      p.packId.toLowerCase().includes(term) ||
      p.cameraName.toLowerCase().includes(term) ||
      p.eventType.toLowerCase().includes(term)
    );
  }
  return results;
};

export const generateAccessLogs = (count: number): AccessLog[] => {
    const actions = ['LOGIN', 'VIEW_LIVE', 'EXPORT_VIDEO', 'UNMASK_VIDEO', 'CHANGE_CONFIG'];
    const users = ['Admin', 'Operator', 'Viewer'];
    
    return Array.from({length: count}, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        userName: users[Math.floor(Math.random() * users.length)],
        userRole: 'ADMIN', 
        action: actions[Math.floor(Math.random() * actions.length)],
        reason: Math.random() > 0.7 ? 'Investigation Case #402' : undefined
    })).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getRetentionRules = (): RetentionRule[] => [
    { severity: 'CRITICAL', days: 365, autoLock: true },
    { severity: 'HIGH', days: 90, autoLock: false },
    { severity: 'MEDIUM', days: 30, autoLock: false },
    { severity: 'LOW', days: 7, autoLock: false },
];

export const generateSecurityIncidents = (): SecurityIncident[] => [];
export const getScoredCameras = () => CONSTANT_CAMERAS.map((c, i) => ({ ...c, telemetry: generateSmartTelemetry(i), posture: calculatePostureScore(c) }));
export const generateBruteForceRunbook = (id: string) => [];
export const generateAnomalyEvents = (count: number): AnomalyEvent[] => [];
export const generateAnomalyStats = (): AnomalyStats[] => [];

export const generateTamperEvents = (): TamperEvent[] => {
  return [
    {
      id: 'evt-tmpr-001',
      type: 'OCCLUSION',
      severity: 'CRITICAL',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
      cameraName: 'ATM Lobby Cam',
      description: 'Camera view completely blocked by spray paint or object.',
      referenceImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
      tamperedImage: 'https://placehold.co/400x225/000000/FFFFFF/png?text=VIDEO+LOSS',
      metrics: {
        score: 98,
        occlusionPct: 95,
        blurVariance: 120
      },
      actionPlaybook: ['Trigger Silent Alarm', 'Notify Branch Manager', 'Switch to Backup Cam']
    },
    {
      id: 'evt-tmpr-002',
      type: 'ROTATION',
      severity: 'HIGH',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      cameraName: 'Parking Exit',
      description: 'Camera angle shifted significantly (-45 degrees).',
      referenceImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400',
      tamperedImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400&h=400', 
      metrics: {
        score: 85,
        occlusionPct: 0,
        blurVariance: 450
      },
      actionPlaybook: ['PTZ Auto-Correction', 'Log Incident']
    }
  ];
};

export const generateCameraHealth = (): CameraHealth[] => {
  return [
    { cameraId: 'cam-001', uptime: '14d 2h', status: 'HEALTHY', bitrate: 4096 },
    { cameraId: 'cam-002', uptime: '14d 2h', status: 'HEALTHY', bitrate: 3800 },
    { cameraId: 'cam-003', uptime: '2d 5h', status: 'WARNING', bitrate: 1200 },
    { cameraId: 'cam-004', uptime: '0d 0h', status: 'CRITICAL', bitrate: 0 },
  ];
};

export const generateDailyReport = (): DailySummaryReport => ({ executiveSummary: '', stats: {} as any, kpi: {} as any, chartData: [], topActions: [], timeline: [] });
export const processSmartQuery = (q: string): SmartQueryResult => ({ textResponse: 'OK', data: [], detectedFilters: {}, accessDenied: false });

export const generateBehaviorEvents = (count: number): BehaviorEvent[] => {
  return Array.from({ length: count }, (_, i) => {
    const type = i === 0 ? 'FIGHT' : i === 1 ? 'FALL' : 'SUSPICIOUS_ROAMING';
    
    // Skeleton Mock for Fall
    const poseData = type === 'FALL' ? {
        id: `skel-${i}`,
        keypoints: [],
        boundingBox: { x: 80, y: 190, w: 100, h: 50 },
        state: 'LYING' as const,
        fallConfidence: 0.92,
        lyingDuration: 12
    } : undefined;

    // Violence Metadata Mock
    const violenceMeta = type === 'FIGHT' ? {
        violenceScore: 92,
        aggressorId: 'person-A',
        victimId: 'person-B',
        interactionType: 'PUNCH' as const,
        isCrowdEvent: false,
        escalationLevel: 3 as const
    } : undefined;

    return {
        id: `beh-${i}`,
        type: type as DetectionType,
        timestamp: new Date(Date.now() - i * 300000),
        cameraName: type === 'FIGHT' ? 'Main Hall Cam' : `Camera-${i+1}`,
        thumbnailUrl: `https://picsum.photos/400/225?random=${i+200}`,
        description: type === 'FIGHT' ? 'Violence detected: Punching' : type === 'FALL' ? 'Person fell' : 'Suspicious activity',
        severity: type === 'FIGHT' ? 'CRITICAL' : 'HIGH',
        confidence: 0.85 + (Math.random() * 0.1),
        status: 'NEW',
        metadata: {
            durationSeconds: type === 'FIGHT' ? 45 : 12,
            actors: type === 'FIGHT' ? 2 : 1,
            poseData: poseData,
            fallMeta: type === 'FALL' ? {
                fallType: 'TRIP',
                preFallPose: 'WALKING',
                impactVelocity: 2.1,
                isRecovered: false
            } : undefined,
            violenceMeta: violenceMeta
        }
    };
  });
};

// ... (Keep Suspect Profiling Logic) ...

export const generateSuspectProfile = (type: ProfileType = 'PERSON'): SuspectProfile => {
  const isPerson = type === 'PERSON';
  const isVehicle = type === 'VEHICLE';
  
  // Random Attributes
  const colors = ['Red', 'Black', 'White', 'Blue', 'Grey'];
  const pColor = colors[Math.floor(Math.random() * colors.length)];
  
  const basicAttrs: ProfileAttribute[] = isPerson ? [
    { key: 'gender', label: 'เพศ (Gender)', value: Math.random() > 0.5 ? 'Male' : 'Female', confidence: 0.95 },
    { key: 'age', label: 'อายุ (Age)', value: '25-35', confidence: 0.82 },
    { key: 'build', label: 'รูปร่าง (Build)', value: 'Medium', confidence: 0.88 }
  ] : [
    { key: 'type', label: 'ประเภท (Type)', value: 'Sedan', confidence: 0.98 },
    { key: 'make', label: 'ยี่ห้อ (Make)', value: 'Toyota', confidence: 0.92 }
  ];

  const appearAttrs: ProfileAttribute[] = isPerson ? [
    { key: 'upper', label: 'เสื้อ (Upper)', value: `${pColor} Hoodie`, confidence: 0.96 },
    { key: 'lower', label: 'กางเกง (Lower)', value: 'Black Jeans', confidence: 0.91 },
    { key: 'accessory', label: 'อุปกรณ์ (Item)', value: 'Backpack', confidence: 0.85 }
  ] : [
    { key: 'color', label: 'สี (Color)', value: pColor, confidence: 0.99 },
    { key: 'plate', label: 'ทะเบียน (Plate)', value: '1กก-9988', confidence: 0.94 }
  ];

  const actionAttrs: ProfileAttribute[] = isPerson ? [
    { key: 'pose', label: 'ท่าทาง (Pose)', value: 'Running', confidence: 0.89 },
    { key: 'interaction', label: 'การกระทำ (Action)', value: 'None', confidence: 0.99 }
  ] : [
    { key: 'speed', label: 'ความเร็ว (Speed)', value: '45 km/h', confidence: 0.92 },
    { key: 'direction', label: 'ทิศทาง (Dir)', value: 'North-East', confidence: 0.95 }
  ];

  // Risk Scoring Logic
  let riskScore = 15; // Base score
  if (isPerson && pColor === 'Black') riskScore += 10;
  if (isPerson && basicAttrs[0].value === 'Male') riskScore += 5;
  if (isVehicle && appearAttrs[0].value === 'Black') riskScore += 20;
  
  // Randomize high risk for demo
  if (Math.random() > 0.7) riskScore += 50;

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (riskScore > 80) riskLevel = 'CRITICAL';
  else if (riskScore > 50) riskLevel = 'HIGH';
  else if (riskScore > 20) riskLevel = 'MEDIUM';

  return {
    id: `PROF-${Date.now()}`,
    type: type,
    snapshotUrl: isPerson 
        ? 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200',
    riskScore,
    riskLevel,
    basicAttributes: basicAttrs,
    appearanceAttributes: appearAttrs,
    actionAttributes: actionAttrs,
    identityMatch: isPerson && Math.random() > 0.8 ? {
        name: 'Mr. Somchai (Blacklist)',
        category: 'BLACKLIST',
        similarity: 0.92
    } : undefined
  };
};
