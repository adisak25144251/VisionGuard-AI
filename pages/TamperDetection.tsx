
import React, { useState, useEffect } from 'react';
import { 
  EyeOff, AlertOctagon, CheckCircle, RefreshCw, Activity, 
  WifiOff, Move, Zap, Eye, AlertTriangle, Layers, ArrowRight,
  ShieldAlert, Play
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateTamperEvents, generateCameraHealth } from '../services/mockAiService';
import { TamperEvent, CameraHealth } from '../types';

const TamperDetection: React.FC = () => {
  const [events, setEvents] = useState<TamperEvent[]>([]);
  const [healthStatus, setHealthStatus] = useState<CameraHealth[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TamperEvent | null>(null);
  
  // Mock Signal Data for Chart
  const [signalData, setSignalData] = useState<any[]>([]);

  useEffect(() => {
    setEvents(generateTamperEvents());
    setHealthStatus(generateCameraHealth());
    
    // Generate initial chart data
    const data = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      bitrate: 4000 + Math.random() * 500,
      loss: Math.random() * 0.5
    }));
    setSignalData(data);
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getTamperIcon = (type: string) => {
    switch (type) {
      case 'OCCLUSION': return <EyeOff size={16} />;
      case 'ROTATION': return <Move size={16} />;
      case 'LIGHT_ATTACK': return <Zap size={16} />;
      case 'SIGNAL_LOSS': return <WifiOff size={16} />;
      default: return <AlertOctagon size={16} />;
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <EyeOff className="text-red-500" /> ระบบตรวจจับการก่อกวน (Tamper Guard)
          </h1>
          <p className="text-slate-400 mt-1">ตรวจสอบความสมบูรณ์ของกล้อง: การบดบัง, การหันเห, และสัญญาณขาดหายแบบเรียลไทม์</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase">ความสมบูรณ์ระบบ</span>
              <span className="text-xl font-mono font-bold text-green-400">98.2%</span>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
              <RefreshCw size={16} /> รีเซ็ตค่าอ้างอิง
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* LEFT: Camera Health Grid */}
        <div className="w-80 flex flex-col gap-4">
           <div className="glass-panel p-4 rounded-xl border border-slate-700 bg-slate-900/50">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                 <Activity size={16} className="text-primary-400" /> สถานะอุปกรณ์
              </h3>
              <div className="space-y-3">
                 {healthStatus.map(cam => (
                    <div key={cam.cameraId} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center hover:border-slate-600 transition-colors">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{cam.cameraId}</div>
                          <div className="text-[10px] text-slate-500">Up: {cam.uptime}</div>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="text-right">
                             <div className={`text-xs font-bold ${cam.status === 'HEALTHY' ? 'text-green-400' : 'text-red-400'}`}>{cam.status}</div>
                             <div className="text-[10px] text-slate-500">{cam.bitrate} kbps</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${cam.status === 'HEALTHY' ? 'bg-green-500' : cam.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <h3 className="text-sm font-bold text-white">แจ้งเตือนล่าสุด</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {events.map(evt => (
                    <div 
                      key={evt.id} 
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${selectedEvent?.id === evt.id ? 'bg-primary-900/20 border-primary-500' : 'bg-slate-900/50 border-slate-800'}`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2 text-white font-bold text-xs">
                             <span className={`p-1 rounded ${getSeverityBadge(evt.severity)}`}>
                                {getTamperIcon(evt.type)}
                             </span>
                             {evt.type}
                          </div>
                          <span className="text-[10px] text-slate-500">{evt.timestamp.toLocaleTimeString()}</span>
                       </div>
                       <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{evt.description}</p>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-500">{evt.cameraName}</span>
                          {evt.severity === 'CRITICAL' && <span className="text-[10px] text-red-400 flex items-center gap-1"><ShieldAlert size={10}/> Action Req.</span>}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* CENTER & RIGHT: Analysis Dashboard */}
        {selectedEvent ? (
           <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
              {/* Before / After Comparison */}
              <div className="glass-panel p-6 rounded-xl border border-slate-700">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <Layers size={20} className="text-primary-400"/> หลักฐานการวิเคราะห์ (Analysis)
                    </h2>
                    <span className="text-xs font-mono text-slate-500">ID: {selectedEvent.id}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 relative">
                    {/* Before Image */}
                    <div className="relative group">
                       <div className="absolute top-2 left-2 bg-green-900/80 text-green-100 px-2 py-1 rounded text-xs font-bold z-10 flex items-center gap-1 border border-green-700">
                          <CheckCircle size={12} /> ภาพอ้างอิง (Reference)
                       </div>
                       <div className="aspect-video bg-black rounded-lg border border-slate-700 overflow-hidden relative">
                          <img src={selectedEvent.referenceImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="mt-2 text-xs text-slate-500 flex justify-between">
                          <span>Last Validated: 24h ago</span>
                          <span>Hash: a1b2...c3d4</span>
                       </div>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-800 p-2 rounded-full border border-slate-600 shadow-xl">
                       <ArrowRight size={24} className="text-slate-200" />
                    </div>

                    {/* After Image */}
                    <div className="relative group">
                       <div className="absolute top-2 left-2 bg-red-900/80 text-red-100 px-2 py-1 rounded text-xs font-bold z-10 flex items-center gap-1 border border-red-700 animate-pulse">
                          <AlertOctagon size={12} /> สิ่งผิดปกติ (Detected)
                       </div>
                       <div className="aspect-video bg-black rounded-lg border-2 border-red-500/50 overflow-hidden relative shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                          <img src={selectedEvent.tamperedImage} className="w-full h-full object-cover" />
                          
                          {/* Simulated Overlay based on type */}
                          {selectedEvent.type === 'OCCLUSION' && (
                             <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                <span className="text-red-500 font-bold border-2 border-red-500 p-4 rounded-xl rotate-[-15deg] text-2xl">VIDEO LOSS</span>
                             </div>
                          )}
                       </div>
                       <div className="mt-2 text-xs text-red-400 flex justify-between font-bold">
                          <span>Detected: {selectedEvent.timestamp.toLocaleTimeString()}</span>
                          <span>Conf: {selectedEvent.metrics.score}%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Metrics & Playbook Row */}
              <div className="flex flex-col lg:flex-row gap-6">
                 {/* Technical Metrics */}
                 <div className="flex-1 glass-panel p-5 rounded-xl border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Activity size={16} className="text-blue-400"/> วิเคราะห์สัญญาณ (Diagnostics)
                    </h3>
                    <div className="h-40 w-full mb-4">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={signalData}>
                             <defs>
                                <linearGradient id="colorBitrate" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px'}} />
                             <Area type="monotone" dataKey="bitrate" stroke="#ef4444" fillOpacity={1} fill="url(#colorBitrate)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">ค่าความเบลอ (Blur)</span>
                          <span className="text-white font-mono text-lg">{selectedEvent.metrics.blurVariance || 'N/A'}</span>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">การบดบัง (Occlusion)</span>
                          <span className="text-white font-mono text-lg">{selectedEvent.metrics.occlusionPct || 0}%</span>
                       </div>
                    </div>
                 </div>

                 {/* Playbook Actions */}
                 <div className="flex-1 glass-panel p-5 rounded-xl border border-slate-700 bg-slate-900/30">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ShieldAlert size={16} className="text-yellow-400"/> คำแนะนำการตอบสนอง
                       </h3>
                       <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">Auto-Generated</span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                       {selectedEvent.actionPlaybook.map((action, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                             <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">{i+1}</div>
                             <span className="text-xs text-slate-200">{action}</span>
                          </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-600 transition-colors">
                          แจ้งเตือนผิดพลาด
                       </button>
                       <button className="py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold shadow-lg shadow-red-900/20 transition-colors flex items-center justify-center gap-2">
                          <AlertTriangle size={14} /> เริ่มมาตรการตอบโต้
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        ) : (
           <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950/50">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800 shadow-inner">
                 <Eye size={40} className="opacity-30" />
              </div>
              <h3 className="text-white font-bold mb-1 text-lg">เลือกเหตุการณ์ (Select an Incident)</h3>
              <p className="text-sm max-w-xs mx-auto">เลือกรายการแจ้งเตือนด้านซ้ายเพื่อดูรายละเอียดหลักฐานและคำแนะนำในการจัดการ</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default TamperDetection;
