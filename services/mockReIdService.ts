
import { ReIdTarget, TrajectoryPoint, CameraNode } from '../types';

// Mock Topology (Map of Cameras)
export const CAMERA_NODES: CameraNode[] = [
  { id: 'cam-001', name: 'Main Gate', x: 10, y: 50, zone: 'Zone A' },
  { id: 'cam-002', name: 'Lobby Entrance', x: 30, y: 50, zone: 'Zone A' },
  { id: 'cam-003', name: 'Elevator Hall', x: 50, y: 30, zone: 'Zone B' },
  { id: 'cam-004', name: 'Corridor 2F', x: 70, y: 30, zone: 'Zone B' },
  { id: 'cam-005', name: 'Server Room', x: 90, y: 30, zone: 'Zone C' },
  { id: 'cam-006', name: 'Parking B1', x: 30, y: 80, zone: 'Zone D' },
  { id: 'cam-007', name: 'Loading Dock', x: 70, y: 80, zone: 'Zone D' },
];

// Mock Targets
const TARGETS: ReIdTarget[] = [
  {
    globalId: 'GID-SUSPECT-001',
    type: 'PERSON',
    baseImage: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200',
    attributes: { color: ['Red', 'Blue'], clothing: 'Red Hoodie, Jeans', accessories: ['Backpack'] },
    confidence: 0.95,
    firstSeen: new Date(Date.now() - 3600000), // 1 hour ago
    lastSeen: new Date(Date.now() - 600000),
  },
  {
    globalId: 'GID-VEHICLE-089',
    type: 'VEHICLE',
    baseImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200',
    attributes: { color: ['Black'], vehicleType: 'Sedan', accessories: [] },
    confidence: 0.92,
    firstSeen: new Date(Date.now() - 7200000),
    lastSeen: new Date(Date.now() - 3600000),
  },
  {
    globalId: 'GID-STAFF-112',
    type: 'PERSON',
    baseImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    attributes: { color: ['White', 'Black'], clothing: 'Uniform, Black Slacks', accessories: ['ID Badge'] },
    confidence: 0.98,
    firstSeen: new Date(Date.now() - 18000000), // 5 hours ago
    lastSeen: new Date(),
  }
];

// Mock Trajectories (Linked to Targets)
const TRAJECTORIES: Record<string, TrajectoryPoint[]> = {
  'GID-SUSPECT-001': [
    { id: 'pt-1', cameraId: 'cam-001', cameraName: 'Main Gate', timestamp: new Date(Date.now() - 3600000), image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200', confidence: 0.99, isConfirmed: true },
    { id: 'pt-2', cameraId: 'cam-006', cameraName: 'Parking B1', timestamp: new Date(Date.now() - 3300000), image: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&q=80&w=200', confidence: 0.88, isConfirmed: true },
    { id: 'pt-3', cameraId: 'cam-002', cameraName: 'Lobby Entrance', timestamp: new Date(Date.now() - 2700000), image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', confidence: 0.92, isConfirmed: true },
    { id: 'pt-4', cameraId: 'cam-003', cameraName: 'Elevator Hall', timestamp: new Date(Date.now() - 1500000), image: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&q=80&w=200', confidence: 0.78, isConfirmed: false }, // Lower confidence, maybe false positive
    { id: 'pt-5', cameraId: 'cam-004', cameraName: 'Corridor 2F', timestamp: new Date(Date.now() - 600000), image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200', confidence: 0.95, isConfirmed: true },
  ],
  'GID-VEHICLE-089': [
    { id: 'vpt-1', cameraId: 'cam-001', cameraName: 'Main Gate', timestamp: new Date(Date.now() - 7200000), image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200', confidence: 0.99, isConfirmed: true },
    { id: 'vpt-2', cameraId: 'cam-007', cameraName: 'Loading Dock', timestamp: new Date(Date.now() - 3600000), image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=200', confidence: 0.94, isConfirmed: true },
  ]
};

export const getReIdTargets = () => TARGETS;
export const getTrajectory = (globalId: string) => TRAJECTORIES[globalId] || [];

export const searchTargets = (query: { type?: string, color?: string }) => {
  return TARGETS.filter(t => {
    if (query.type && t.type !== query.type) return false;
    if (query.color && !t.attributes.color.some(c => c.toLowerCase().includes(query.color!.toLowerCase()))) return false;
    return true;
  });
};
