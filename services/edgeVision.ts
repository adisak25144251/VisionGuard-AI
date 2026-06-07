import { Camera, CameraStatus } from '../types';

export interface VisionBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
  color: string;
}

export interface VisionMetrics {
  fps: number;
  motionRatio: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  frameHash: string;
  resolution: string;
  tamperStatus: 'NORMAL' | 'LOW_LIGHT' | 'OVEREXPOSED' | 'OCCLUDED' | 'BLURRY' | 'NO_FRAME';
  analyzedAt: number;
}

export interface VisionEvent {
  id: string;
  timestamp: Date;
  cameraId: string;
  cameraName: string;
  type: 'MOTION' | 'TAMPER' | 'QUALITY';
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  confidence: number;
}

export interface VisionAnalysis {
  boxes: VisionBox[];
  metrics: VisionMetrics;
  event?: VisionEvent;
}

interface FrameState {
  previous: Uint8ClampedArray | null;
  lastAt: number;
  lastEventAt: number;
}

const WIDTH = 160;
const HEIGHT = 90;
const EVENT_COOLDOWN_MS = 2500;

const states = new Map<string, FrameState>();

const defaultSecurity = {
  encryption: 'LOCAL_BROWSER_MEDIA',
  authMethod: 'USER_PERMISSION',
  firmwareVersion: 'browser-media-device',
  lastSecurityAudit: new Date(),
  zeroTrustEnabled: true,
  isDefaultCreds: false,
  httpsEnabled: true,
  portExposed: false,
  failedLoginCount: 0
};

const defaultForensics = {
  watermarkEnabled: true,
  watermarkText: 'VISIONGUARD LOCAL EDGE',
  digitalSignature: true,
  rollingHash: true,
  retentionPolicy: 'LOCAL_SESSION'
};

const fnv1a = (bytes: Uint8ClampedArray) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 16) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const createMotionBox = (
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  motionRatio: number
): VisionBox | null => {
  if (maxX <= minX || maxY <= minY) return null;

  return {
    id: 'motion-primary',
    x: clamp((minX / WIDTH) * 100, 0, 100),
    y: clamp((minY / HEIGHT) * 100, 0, 100),
    w: clamp(((maxX - minX) / WIDTH) * 100, 5, 100),
    h: clamp(((maxY - minY) / HEIGHT) * 100, 5, 100),
    label: 'Motion',
    confidence: clamp(0.55 + motionRatio * 8, 0.55, 0.98),
    color: '#22d3ee'
  };
};

export const createLocalWebcamCamera = (deviceId: string, label?: string): Camera => ({
  id: `webcam-${deviceId || 'default'}`,
  name: label || 'Local Webcam',
  location: 'This device',
  ipAddress: 'local-browser',
  macAddress: 'browser-managed',
  status: CameraStatus.RECORDING,
  url: deviceId || 'default',
  streamType: 'WEBCAM',
  features: ['Edge Motion', 'Tamper Guard', 'Privacy Mask'],
  security: defaultSecurity,
  forensics: defaultForensics,
  privacyMasks: [],
  activeModels: [
    { modelId: 'edge-frame-diff-v1', confidenceThreshold: 0.55, enabled: true },
    { modelId: 'edge-tamper-quality-v1', confidenceThreshold: 0.75, enabled: true }
  ]
});

export const loadStoredCameras = (): Camera[] => {
  const saved = localStorage.getItem('visionguard_cameras');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredCameras = (cameras: Camera[]) => {
  localStorage.setItem('visionguard_cameras', JSON.stringify(cameras));
};

export const analyzeVideoFrame = (
  camera: Camera,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): VisionAnalysis | null => {
  if (!video.videoWidth || !video.videoHeight) return null;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
  const image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const { data } = image;
  const now = performance.now();
  const state = states.get(camera.id) || { previous: null, lastAt: now, lastEventAt: 0 };

  let lumaSum = 0;
  let lumaSq = 0;
  let edgeSum = 0;
  let motionPixels = 0;
  let minX = WIDTH;
  let minY = HEIGHT;
  let maxX = 0;
  let maxY = 0;
  const gray = new Uint8ClampedArray(WIDTH * HEIGHT);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const pixel = y * WIDTH + x;
      const i = pixel * 4;
      const luma = Math.round(data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722);
      gray[pixel] = luma;
      lumaSum += luma;
      lumaSq += luma * luma;

      if (x > 0 && y > 0) {
        const gradient = Math.abs(luma - gray[pixel - 1]) + Math.abs(luma - gray[pixel - WIDTH]);
        edgeSum += gradient;
      }

      if (state.previous) {
        const diff = Math.abs(luma - state.previous[pixel]);
        if (diff > 28) {
          motionPixels += 1;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
  }

  const total = WIDTH * HEIGHT;
  const brightness = lumaSum / total;
  const variance = Math.max(0, lumaSq / total - brightness * brightness);
  const contrast = Math.sqrt(variance);
  const sharpness = edgeSum / total;
  const motionRatio = motionPixels / total;
  const elapsed = Math.max(1, now - state.lastAt);
  const fps = 1000 / elapsed;
  const boxes = [];
  const motionBox = createMotionBox(minX, minY, maxX, maxY, motionRatio);
  if (motionBox && motionRatio > 0.015) boxes.push(motionBox);

  let tamperStatus: VisionMetrics['tamperStatus'] = 'NORMAL';
  if (brightness < 18) tamperStatus = 'LOW_LIGHT';
  else if (brightness > 238) tamperStatus = 'OVEREXPOSED';
  else if (contrast < 6 && sharpness < 8) tamperStatus = 'OCCLUDED';
  else if (sharpness < 7) tamperStatus = 'BLURRY';

  const metrics: VisionMetrics = {
    fps: Math.round(clamp(fps, 0, 60)),
    motionRatio,
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    sharpness: Math.round(sharpness),
    frameHash: fnv1a(data),
    resolution: `${video.videoWidth}x${video.videoHeight}`,
    tamperStatus,
    analyzedAt: Date.now()
  };

  let event: VisionEvent | undefined;
  if (now - state.lastEventAt > EVENT_COOLDOWN_MS) {
    if (tamperStatus !== 'NORMAL') {
      event = {
        id: `evt-${camera.id}-${Date.now()}`,
        timestamp: new Date(),
        cameraId: camera.id,
        cameraName: camera.name,
        type: 'TAMPER',
        severity: tamperStatus === 'OCCLUDED' || tamperStatus === 'LOW_LIGHT' ? 'HIGH' : 'MEDIUM',
        message: `Camera quality anomaly: ${tamperStatus.replace('_', ' ')}`,
        confidence: tamperStatus === 'OCCLUDED' ? 0.92 : 0.78
      };
    } else if (motionRatio > 0.035) {
      event = {
        id: `evt-${camera.id}-${Date.now()}`,
        timestamp: new Date(),
        cameraId: camera.id,
        cameraName: camera.name,
        type: 'MOTION',
        severity: motionRatio > 0.12 ? 'HIGH' : 'INFO',
        message: `Real motion detected from live camera frame (${Math.round(motionRatio * 100)}%)`,
        confidence: clamp(0.6 + motionRatio * 6, 0.6, 0.98)
      };
    }
  }

  states.set(camera.id, {
    previous: gray,
    lastAt: now,
    lastEventAt: event ? now : state.lastEventAt
  });

  return { boxes, metrics, event };
};

