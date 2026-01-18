
import { DetectionType } from '../types';

export interface AlertTemplate {
  id: string;
  featureName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  shortMessage: string;
  longMessage: string;
  englishSubtitle: string;
  actions: string[];
  examples: {
    situation: string;
    placeholders: Record<string, string>;
  }[];
}

export const ALERT_TEMPLATES: Record<string, AlertTemplate> = {
  // --- CORE SECURITY ---
  SUSPICIOUS_DETECTED: {
    id: 'SEC-NEW',
    featureName: 'New Suspicious Target (พบเป้าหมายใหม่)',
    severity: 'HIGH',
    shortMessage: "🚨 ตรวจพบสิ่งผิดปกติ: พบ {object_type} ระดับความเสี่ยง {risk_score} ที่ {location}",
    longMessage: `🚨 **VisionGuard Alert: New Target**
ID: {trace_id}
เวลา: {time}
สถานที่: {location}
ประเภท: {object_type} (Risk: {risk_score})
จุดสังเกต: {attributes}

[📷 ดูภาพ Snapshot] [📡 เริ่มติดตามบนแผนที่]`,
    englishSubtitle: "New suspicious target detected. High risk assessment.",
    actions: ["📡 เริ่มติดตาม (Start Pursuit)", "📸 บันทึกภาพ", "👮 แจ้งสายตรวจ"],
    examples: [
        {
            situation: "Unidentified person in corridor",
            placeholders: {
                object_type: "บุคคล (Person)",
                risk_score: "85",
                location: "Corridor B, Floor 2",
                time: "23:45:10",
                trace_id: "TRK-2024-001",
                attributes: "เสื้อฮู้ดสีดำ, สะพายเป้"
            }
        },
        {
            situation: "Vehicle lurking at back gate",
            placeholders: {
                object_type: "ยานพาหนะ (Vehicle)",
                risk_score: "70",
                location: "Gate 4 (Rear)",
                time: "02:15:33",
                trace_id: "VEH-2024-889",
                attributes: "รถตู้สีขาว ไม่ติดแผ่นป้าย"
            }
        }
    ]
  },
  
  HANDOFF_SUCCESS: {
    id: 'SEC-TRACK',
    featureName: 'Pursuit Update (ติดตามต่อเนื่อง)',
    severity: 'MEDIUM',
    shortMessage: "📡 Tracking Update: เป้าหมาย {trace_id} เคลื่อนที่ไปยัง {location}",
    longMessage: `📡 **VisionGuard Pursuit: Update**
เป้าหมาย {trace_id} ถูกพบอีกครั้ง
📍 ตำแหน่งปัจจุบัน: {location}
⏱️ เวลาตั้งแต่พบครั้งแรก: {duration} นาที
🔮 คาดการณ์จุดต่อไป: {next_location}

[📍 ดูเส้นทาง]`,
    englishSubtitle: "Target re-identified at new location.",
    actions: ["👀 ดูภาพสด", "📍 อัปเดตพิกัด"],
    examples: [
        {
            situation: "Target moved from Hall to Staircase",
            placeholders: {
                trace_id: "TRK-2024-001",
                location: "Staircase A",
                duration: "3",
                next_location: "Parking B1"
            }
        }
    ]
  },

  RESTRICTED_ENTRY: {
    id: 'SEC-BREACH',
    featureName: 'Zone Breach (บุกรุกพื้นที่หวงห้าม)',
    severity: 'CRITICAL',
    shortMessage: "⛔ CRITICAL: เป้าหมาย {trace_id} บุกรุกพื้นที่หวงห้าม {zone_name}!",
    longMessage: `⛔ **VisionGuard Alert: ZONE BREACH**
⚠️ แจ้งเตือนระดับวิกฤต
เป้าหมาย {trace_id} ได้เข้ามาในพื้นที่ {zone_name}

มาตรการอัตโนมัติ:
1. บันทึกภาพความละเอียดสูง (Locked)
2. แจ้งเตือนหัวหน้าชุด รปภ.

[🔊 เปิดเสียงไซเรน] [📞 โทรแจ้งเจ้าหน้าที่]`,
    englishSubtitle: "Critical: Target entered restricted zone.",
    actions: ["🔊 เปิดไซเรน", "🔒 ล็อคประตู", "👮 ส่งหน่วยจู่โจม"],
    examples: [
        {
            situation: "Unauthorized entry to Server Room",
            placeholders: {
                trace_id: "TRK-2024-005",
                zone_name: "Server Room (Zone S)"
            }
        }
    ]
  },

  TARGET_LOST: {
    id: 'SEC-LOST',
    featureName: 'Target Lost (เป้าหมายหายไป)',
    severity: 'MEDIUM',
    shortMessage: "⚠️ Target Lost: ไม่พบเป้าหมาย {trace_id} นานเกิน {timeout} นาที",
    longMessage: `⚠️ **VisionGuard Status: TARGET LOST**
ขาดการติดต่อกับเป้าหมาย {trace_id}
พบครั้งสุดท้าย: {last_time}
กล้องสุดท้าย: {location}
คำแนะนำ: โปรดตรวจสอบพื้นที่ใกล้เคียง หรือดูกล้องย้อนหลัง

[🔎 ค้นหาอัจฉริยะ]`,
    englishSubtitle: "Target lost. No visual contact for defined threshold.",
    actions: ["🔎 ค้นหาอัจฉริยะ", "🔄 Replay กล้องสุดท้าย"],
    examples: [
        {
            situation: "Lost contact after Parking Lot",
            placeholders: {
                trace_id: "TRK-2024-001",
                timeout: "5",
                last_time: "10:30:00",
                location: "Parking B1 Exit"
            }
        }
    ]
  },

  PROFILE_ENRICHED: {
    id: 'INTEL-UPDATE',
    featureName: 'Profile Enriched (ข้อมูลเพิ่มเติม)',
    severity: 'INFO',
    shortMessage: "ℹ️ Profile Update: ระบุตัวตนเป้าหมาย {trace_id} ได้แล้ว คือ {identity}",
    longMessage: `📝 **VisionGuard Intel: Profile Enriched**
อัปเดตข้อมูลเป้าหมาย {trace_id}
✅ ระบุตัวตน: {identity}
🔢 ทะเบียนรถ: {plate}
🚩 ระดับความเสี่ยงใหม่: {risk_level}

[📂 ดูโปรไฟล์ฉบับเต็ม]`,
    englishSubtitle: "New intelligence data available for target.",
    actions: ["📂 ดูโปรไฟล์", "💾 บันทึกประวัติ"],
    examples: [
        {
            situation: "Face recognition match found",
            placeholders: {
                trace_id: "TRK-2024-001",
                identity: "Mr. Somchai (Blacklist)",
                plate: "-",
                risk_level: "HIGH"
            }
        }
    ]
  },

  VIOLENCE: {
    id: 'SEC-06',
    featureName: 'Violence Detection (ตรวจจับเหตุทะเลาะวิวาท)',
    severity: 'CRITICAL',
    shortMessage: "🆘 FIGHT ALERT: พบเหตุทำร้ายร่างกายที่ {location} (Violence Score: {score})",
    longMessage: `🆘 **แจ้งเตือนเหตุความรุนแรง (Violence Alert)**
🔴 ระดับความรุนแรง: {severity} (Score: {score}/100)
📍 สถานที่: {camera_name} - {location}
🕒 เวลา: {time}
💥 ประเภทการปะทะ: {interaction_type}
📝 รายละเอียด: AI ตรวจพบการเคลื่อนไหวที่รุนแรงและปะทะกันของบุคคล 2 รายขึ้นไป กรุณาระงับเหตุทันที`,
    englishSubtitle: "Physical violence detected. Immediate security intervention required.",
    actions: ["📢 เปิดเสียงเตือน (Siren)", "👮 ส่งหน่วยระงับเหตุ", "📞 แจ้งตำรวจ 191"],
    examples: [
        {
            situation: "Fight detected in Canteen",
            placeholders: {
                location: "Canteen Area",
                score: "88",
                severity: "CRITICAL",
                camera_name: "Cam-12",
                time: "12:15:00",
                interaction_type: "Punching/Kicking"
            }
        }
    ]
  },
  INTRUSION: {
      id: 'SEC-00',
      featureName: 'Intrusion Detection (การบุกรุกพื้นที่)',
      severity: 'CRITICAL',
      shortMessage: "🚨 บุกรุก: พบ {object} เข้ามาใน {zone_name} ({zone_type})",
      longMessage: `🚨 **แจ้งเตือนการบุกรุก (Intrusion Alert)**
  🔴 ระดับความรุนแรง: {severity}
  📍 โซน: {zone_name} ({zone_type})
  📷 กล้อง: {camera_name}
  🕒 เวลา: {time}
  👤 วัตถุที่ตรวจพบ: {object}
  📝 รายละเอียด: ระบบตรวจพบการฝ่าฝืน Virtual Fence/Zone ในพื้นที่หวงห้าม โปรดตรวจสอบทันที`,
      englishSubtitle: "Unauthorized entry detected in restricted zone. Immediate action required.",
      actions: ["🔊 เปิดไซเรน", "👮 แจ้งหัวหน้าชุด รปภ.", "📸 บันทึกภาพหลักฐาน"],
      examples: [
          {
              situation: "Perimeter breach at night",
              placeholders: {
                  object: "Person",
                  zone_name: "North Fence",
                  zone_type: "Perimeter",
                  severity: "HIGH",
                  camera_name: "Cam-01",
                  time: "03:22:15"
              }
          }
      ]
    }
};
