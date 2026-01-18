
// ... (Previous imports)

// --- CORE TYPES (Existing) ---
export const CameraStatus = {
  RECORDING: 'RECORDING',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  ALERT: 'ALERT',
  MAINTENANCE: 'MAINTENANCE'
} as const;

export type CameraStatus = typeof CameraStatus[keyof typeof CameraStatus];

// ... (Keep existing Camera, DetectionType interfaces) ...

export interface Camera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  status: CameraStatus;
  url: string;
  streamType: string;
  features: string[];
  security: {
    encryption: string;
    authMethod: string;
    firmwareVersion: string;
    lastSecurityAudit: Date;
    zeroTrustEnabled: boolean;
    isDefaultCreds: boolean;
    httpsEnabled: boolean;
    portExposed: boolean;
    failedLoginCount: number;
  };
  forensics: {
    watermarkEnabled: boolean;
    watermarkText: string;
    digitalSignature: boolean;
    rollingHash: boolean;
    retentionPolicy: string;
  };
  privacyMasks: { id: string; label: string; points: {x: number, y: number}[] }[];
  activeModels: { modelId: string; confidenceThreshold: number; enabled: boolean }[];
  telemetry?: CameraTelemetry;
  posture?: SecurityScoreBreakdown;
}

export const DetectionType = {
  PERSON: 'PERSON',
  VEHICLE: 'VEHICLE',
  INTRUSION: 'INTRUSION',
  ANOMALY: 'ANOMALY',
  WEAPON: 'WEAPON',
  FIRE: 'FIRE',
  FALL: 'FALL',
  FIGHT: 'FIGHT',
  SUSPICIOUS_ROAMING: 'SUSPICIOUS_ROAMING',
  LOITERING: 'LOITERING',
  PPE: 'PPE',
  SMOKING: 'SMOKING',
  TRASH: 'TRASH',
  WRONG_WAY: 'WRONG_WAY',
  PARKING: 'PARKING',
  QUEUE: 'QUEUE',
  DOOR: 'DOOR',
  CROWD: 'CROWD',
  HEATMAP: 'HEATMAP',
  LPR_MATCH: 'LPR_MATCH',
  ABANDONED_OBJ: 'ABANDONED_OBJ',
  TAILGATING: 'TAILGATING',
  TRASH_SPILL: 'TRASH_SPILL',
  PARKING_OVERSTAY: 'PARKING_OVERSTAY',
  QUEUE_OVERLOAD: 'QUEUE_OVERLOAD',
  DOOR_OPEN: 'DOOR_OPEN',
  CROWD_DENSITY: 'CROWD_DENSITY',
  HEATMAP_TRAFFIC: 'HEATMAP_TRAFFIC'
} as const;

export type DetectionType = typeof DetectionType[keyof typeof DetectionType];

// ... (Keep LogEntry, PlateRecord, etc.) ...

export interface LogEntry {
  id: string;
  timestamp: Date;
  cameraName: string;
  type: string;
  details: string;
  confidence: number;
  isAlert: boolean;
}

export interface PlateRecord {
  id: string;
  plateNumber: string;
  province: string;
  timestamp: Date;
  cameraName: string;
  imageFull: string;
  imageCrop: string;
  vehicleType: string;
  vehicleColor: string;
  confidence: number;
  isWatchlist: boolean;
}

export type FaceCategory = 'VIP' | 'BLACKLIST' | 'STAFF' | 'VISITOR' | 'UNKNOWN';

export interface FaceProfile {
  id: string;
  name: string;
  category: FaceCategory;
  notes: string;
  lastSeen: Date;
  imageUrl: string;
}

export interface FaceEvent {
  id: string;
  name: string;
  category: FaceCategory;
  timestamp: Date;
  cameraName: string;
  confidence: number;
  imageUrl: string;
}

export type FeatureType = 'LOITERING' | 'QUEUE' | 'INTRUSION' | 'FALL' | 'PPE' | 'ANOMALY' | 'LPR' | 'FACE' | 'TRAFFIC' | 'SAFETY';

export interface RuleConfig {
  id: string;
  name: string;
  cameraId: string;
  cameraName: string;
  featureType: FeatureType | string;
  isActive: boolean;
  sensitivity: number;
  schedule: string;
  alerts: any[];
  lastTriggered?: Date;
}

export interface EvidencePack {
  id: string;
  packId: string;
  timestamp: Date;
  eventType: string;
  cameraName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  videoUrl: string;
  snapshots: string[];
  sizeBytes: number;
  metadata: {
    confidence: number;
    zoneName: string;
    objectCount: number;
    attributes?: { color?: string[]; direction?: string; trackId?: string };
  };
  manifest?: EvidenceManifest;
}

export type RetentionPolicy = '30_DAYS' | 'LEGAL_HOLD_FOREVER' | '7_DAYS';

export interface SecurityIncident {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  ruleId: string;
  category: string;
  description: string;
  sourceIp?: string;
  targetCameraId?: string;
  targetCameraName?: string;
  status: 'OPEN' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
  runbook?: RunbookStep[];
}

export interface DeviceSecurityScore {
  // Placeholder
}

export interface AnomalyEvent {
  id: string;
  type: DetectionType | string;
  timestamp: Date;
  cameraName: string;
  thumbnailUrl: string;
  description: string;
  score: number;
  status: 'NEW' | 'REVIEWED' | 'FALSE_POSITIVE';
  metrics: {
    label: string;
    current: string | number;
    baseline: string | number;
    deviation: string;
  };
}

export interface AnomalyStats {
  hour: string;
  score: number;
  count: number;
}

export interface TamperEvent {
  id: string;
  type: 'OCCLUSION' | 'ROTATION' | 'LIGHT_ATTACK' | 'SIGNAL_LOSS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  cameraName: string;
  description: string;
  referenceImage: string;
  tamperedImage: string;
  metrics: {
    score: number;
    blurVariance?: string | number;
    occlusionPct?: number;
  };
  actionPlaybook: string[];
}

export interface CameraHealth {
  cameraId: string;
  uptime: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  bitrate: number;
}

export interface EvidenceManifest {
  version: string;
  packId: string;
  integrityHash: string;
  ledger: ChainEntry[];
}

export interface ChainEntry {
  timestamp: Date;
  action: 'GENERATED' | 'LOCKED' | 'VIEWED' | string;
  actor: string;
  currHash: string;
}

export interface SearchFilters {
  dateRange: '1H' | '24H' | '7D' | '30D';
  cameras: string[];
  eventTypes: string[];
  severity: string[];
  attributes: { color: string; direction: string; trackId: string };
  confidenceMin: number;
}

export interface SecurityScoreBreakdown {
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
  issues: { label: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  vulnerabilities: number;
}

export interface RunbookStep {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  actionType: 'BUTTON' | 'CHECKBOX' | 'LINK';
  actionLabel?: string;
}

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export interface CameraTelemetry {
  fps: number;
  targetFps: number;
  jitterMs: number;
  packetLossPct: number;
  bitrateKbps: number;
  resolution: string;
  reconnectCount: number;
  uptimeSeconds: number;
  healthStatus: HealthStatus;
  isDegradedMode: boolean;
  signalStrength: number;
  recommendations: string[];
}

export interface DailySummaryReport {
  executiveSummary: string;
  stats: {
    totalEvents: number;
    criticalEvents: number;
    resolvedEvents: number;
    peakHour: string;
    topRiskyZone: string;
  };
  kpi: {
    falseAlarmRate: number;
    avgResponseTime: number;
    uptime: number;
  };
  chartData: { time: string; count: number }[];
  topActions: PriorityAction[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  camera: string;
  status: 'RESOLVED' | 'OPEN' | string;
  image?: string;
}

export interface PriorityAction {
  id: string;
  task: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  assignee?: string;
  isDone: boolean;
}

export interface SmartQueryResult {
  textResponse: string;
  data: EvidencePack[];
  detectedFilters: Record<string, any>;
  accessDenied: boolean;
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  userName: string;
  userRole: string;
  action: string;
  reason?: string;
}

export interface PrivacyConfig {
  autoBlurFaces: boolean;
  autoBlurPlates: boolean;
  blurPrivateZones: boolean;
  requireReasonForUnmask: boolean;
  watermarkUserIdentity: boolean;
  pdpaNoticeText: string;
}

export interface RetentionRule {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  days: number;
  autoLock: boolean;
}

export interface BehaviorEvent {
  id: string;
  type: DetectionType;
  timestamp: Date;
  cameraName: string;
  thumbnailUrl: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  status: 'NEW' | 'REVIEWED' | string;
  metadata: {
    durationSeconds: number;
    actors: number;
    poseData?: any;
    fallMeta?: any;
    violenceMeta?: any;
  };
}

export interface CameraCalibration {
  // Placeholder
}

export interface ThresholdProfile {
  // Placeholder
}

export interface EvidenceAsset {
  // Placeholder
}

export type TrajectoryType = 'PERSON' | 'VEHICLE';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface StorageConfig {
  // Placeholder
}

export interface Point {
  x: number;
  y: number;
}

export interface IntrusionZone {
  id: string;
  label: string;
  shape: 'POLYGON' | 'LINE';
  points: Point[];
  type: 'WARNING' | 'RESTRICTED' | 'SAFE';
  isActive: boolean;
  color: string;
  rules: {
    minDuration: number;
    classes: string[];
    schedule: string;
    direction: string;
  };
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date;
  pendingItems: number;
  bufferUsagePct: number;
  uploadSpeedKBps: number;
  status: 'IDLE' | 'SYNCING' | 'OFFLINE';
}

export interface BufferItem {
  id: string;
  timestamp: Date;
  eventType: string;
  sizeKB: number;
  priority: 'HIGH' | 'NORMAL';
}

export interface ReIdTarget {
  globalId: string;
  type: 'PERSON' | 'VEHICLE';
  baseImage: string;
  attributes: { color: string[]; clothing?: string; vehicleType?: string; accessories: string[] };
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface TrajectoryPoint {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  image: string;
  confidence: number;
  isConfirmed: boolean;
}

export interface CameraNode {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
}

// --- GEO INTELLIGENCE TYPES ---

export type GeoAccuracyLevel = 'LEVEL_A_BASIC' | 'LEVEL_B_HOMOGRAPHY' | 'LEVEL_C_TRIANGULATION';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  heading?: number; // 0-360 degrees
  speed?: number; // km/h
  level: GeoAccuracyLevel;
}

export interface GeoCamera extends Camera {
  geo: {
    lat: number;
    lng: number;
    fovRadius: number; // meters
    heading: number; // Camera facing direction
    zoneId?: string;
  };
}

export interface GeoEvent {
  id: string;
  eventId?: string; // Links to main Event ID
  type: DetectionType | 'PERSON' | 'VEHICLE';
  timestamp: Date;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  camera?: {
    id: string;
    name: string;
  };
  location: { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number; level?: string | GeoAccuracyLevel };
  targetSnapshot?: string;
  description?: string;
  // Linking to Profiling
  profileId?: string;
}

export interface GeoZone {
  id: string;
  name: string;
  type: 'RESTRICTED' | 'WARNING' | 'SAFE';
  coordinates?: [number, number][]; // Polygon array of [lat, lng]
  points?: { lat: number, lng: number }[]; // Backup points
  color?: string;
}

// --- PURSUIT & TRACKING TYPES ---

export type PursuitStatus = 'ACTIVE' | 'LOST' | 'ACQUIRED' | 'FINISHED';

export interface SuspectAttribute {
  label: string;
  value: string;
  confidence: number;
}

export interface PursuitUpdate {
  id: string; // Step ID
  timestamp: Date;
  cameraId: string;
  cameraName: string;
  action: 'ENTER' | 'EXIT' | 'PASSING' | 'LOST' | 'ACQUIRED';
  confidence: number;
  snapshotUrl: string;
}

export interface SuspectToken {
  tokenId: string;
  status: PursuitStatus;
  startTime: Date;
  lastSeenTime: Date;
  lastCameraId: string;
  predictedNextCameras: string[]; // IDs of probable next cams
  attributes: {
    upperColor: string;
    lowerColor: string;
    type: string;
  };
  timeline: PursuitUpdate[];
  // Link to rich profile
  profile?: SuspectProfile;
}

export interface CameraTopology {
  sourceId: string;
  targetId: string;
  weight: number; // travel time or distance
}

// --- NEW: PROFILING & ENRICHMENT TYPES ---

export type ProfileType = 'PERSON' | 'VEHICLE' | 'OBJECT';

export interface ProfileAttribute {
  key: string;
  label: string; // Thai Label e.g., "สีเสื้อ"
  value: string; // e.g., "แดง (Red)"
  confidence: number; // 0-1.0
  icon?: string;
}

export interface SuspectProfile {
  id: string;
  type: ProfileType;
  snapshotUrl: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Categorized Attributes
  basicAttributes: ProfileAttribute[]; // Gender, Age, Car Type
  appearanceAttributes: ProfileAttribute[]; // Clothing, Color, Accessories
  actionAttributes: ProfileAttribute[]; // Pose, Speed, Direction
  
  // Advanced Analysis
  identityMatch?: {
    name: string;
    category: FaceCategory;
    similarity: number;
  };
  
  lprMatch?: {
    plate: string;
    province: string;
    isWatchlist: boolean;
  };

  objectDetails?: {
    leftBehindDuration?: number; // minutes
    size?: string;
  };
}
