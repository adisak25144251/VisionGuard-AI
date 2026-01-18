
import { Camera, CameraStatus } from './types';

// --- CONFIGURATION ---
// เปลี่ยนเป็น IP ของเครื่อง Server ที่รัน AI Backend ของคุณ
// เช่น 'http://192.168.1.50:8000'
// หากรัน Localhost ให้ใช้ IP เครื่องคอมพิวเตอร์แทนคำว่า localhost เพื่อให้มือถือเข้าได้
export const API_BASE_URL = 'http://localhost:8000/api'; 
export const WS_BASE_URL = 'ws://localhost:8000/ws';

// START EMPTY - User must add real cameras via Settings
export const MOCK_CAMERAS: Camera[] = [];

export const NAV_ITEMS = [
  // Overview
  { label: 'แดชบอร์ด', path: '/', category: 'ภาพรวม' },
  { label: 'กล้องวงจรปิดสด', path: '/live', category: 'ภาพรวม' },
  
  // Intelligence Modules
  { label: 'ฟีเจอร์อัจฉริยะ', path: '/features', category: 'ระบบอัจฉริยะ' },
  { label: 'ตรวจจับการบุกรุก', path: '/intrusion', category: 'ระบบอัจฉริยะ' },
  { label: 'นับจำนวนจราจร', path: '/lane-counting', category: 'ระบบอัจฉริยะ' },
  { label: 'อ่านป้ายทะเบียน (LPR)', path: '/lpr', category: 'ระบบอัจฉริยะ' },
  { label: 'จดจำใบหน้า', path: '/face-rec', category: 'ระบบอัจฉริยะ' },
  
  // Safety & Facility
  { label: 'ความปลอดภัย & อัคคีภัย', path: '/safety', category: 'อาคารสถานที่' },
  { label: 'บริหารลานจอด', path: '/parking', category: 'อาคารสถานที่' },
  
  // Forensics
  { label: 'คลังหลักฐาน', path: '/evidence', category: 'สืบค้นข้อมูล' },
  { label: 'อัปโหลดวิดีโอ', path: '/upload', category: 'สืบค้นข้อมูล' },
  { label: 'ประวัติเหตุการณ์', path: '/events', category: 'สืบค้นข้อมูล' },
  
  // System
  { label: 'เอกสารระบบ', path: '/docs', category: 'ระบบ' },
  { label: 'ตั้งค่า', path: '/settings', category: 'ระบบ' },
];
