import React, { useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Search, Filter, Download, AlertTriangle, WifiOff } from 'lucide-react';
import { VisionEvent } from '../services/edgeVision';

const toLogEntry = (event: VisionEvent): LogEntry => ({
  id: event.id,
  timestamp: new Date(event.timestamp),
  cameraName: event.cameraName,
  type: event.type,
  details: event.message,
  confidence: event.confidence,
  isAlert: event.severity === 'HIGH' || event.severity === 'CRITICAL'
});

const loadRealEvents = (): LogEntry[] => {
  const stored = localStorage.getItem('visionguard_live_events');
  if (!stored) return [];

  try {
    const events = JSON.parse(stored) as VisionEvent[];
    return events.map(toLogEntry).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch {
    return [];
  }
};

const Events: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLogs(loadRealEvents());
    const interval = window.setInterval(() => setLogs(loadRealEvents()), 3000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      log.cameraName.toLowerCase().includes(term) ||
      log.type.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">ประวัติเหตุการณ์ & บันทึก (Logs)</h1>
          <p className="text-slate-400 mt-1">แสดงเฉพาะเหตุการณ์ที่เกิดจาก live webcam/backend จริง</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหากล้อง, event, รายละเอียด"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white" title="ตัวกรอง">
            <Filter size={20} />
          </button>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white" title="ดาวน์โหลด">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-6 py-4">เวลา</th>
                <th className="px-6 py-4">กล้อง</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">รายละเอียด</th>
                <th className="px-6 py-4">ความเชื่อมั่น</th>
                <th className="px-6 py-4 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors animate-fade-in">
                  <td className="px-6 py-4 font-mono text-slate-300">{log.timestamp.toLocaleTimeString()}</td>
                  <td className="px-6 py-4">{log.cameraName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      log.isAlert ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">{log.details}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${log.confidence > 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${log.confidence * 100}%` }} />
                      </div>
                      <span className="text-xs">{(log.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {log.isAlert ? (
                      <span className="text-red-400 font-semibold flex justify-end items-center gap-1">
                        <AlertTriangle size={14} /> แจ้งเตือน
                      </span>
                    ) : (
                      <span className="text-green-500/60">ปกติ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
              <WifiOff size={24} className="opacity-50" />
            </div>
            <p className="text-lg font-bold text-slate-400">ยังไม่มีเหตุการณ์จริง</p>
            <p className="text-xs text-slate-600 mt-2">เปิดหน้า Live Monitor และอนุญาตกล้องเพื่อให้ระบบบันทึก event จากเฟรมจริง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
