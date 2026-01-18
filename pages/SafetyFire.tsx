
import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, AlertTriangle, HardHat, ShieldCheck, Thermometer, Wind, AlertOctagon,
  Activity, PersonStanding, Play, PhoneCall, Volume2, CheckSquare, Settings,
  Siren, Stethoscope, ChevronRight, Layout, Droplets, BellRing, History, PieChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateBehaviorEvents } from '../services/mockAiService';
import { BehaviorEvent } from '../types';

// Skeleton Component
const FallSkeletonVisualizer = ({ active, isFall }: { active: boolean, isFall: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      // Clear
      ctx.clearRect(0, 0, 400, 300);
      
      const t = Date.now() / 1000;
      
      ctx.strokeStyle = isFall ? '#ef4444' : '#22d3ee'; // Red for Fall, Cyan for Normal
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Center
      const cx = 200;
      const cy = 200; // Floor level

      if (isFall) {
          // Lying Down Pose
          const headX = cx - 60;
          const headY = cy + 40;
          const hipX = cx;
          const hipY = cy + 45;
          const feetX = cx + 70;
          const feetY = cy + 40;

          // Body Line
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(hipX, hipY);
          ctx.lineTo(feetX, feetY);
          ctx.stroke();

          // Head Circle
          ctx.beginPath();
          ctx.arc(headX - 10, headY, 10, 0, Math.PI*2);
          ctx.stroke();

          // Arms (Sprawled)
          ctx.beginPath();
          ctx.moveTo(headX + 20, headY + 5); 
          ctx.lineTo(headX + 20, headY - 30); // Arm up
          ctx.stroke();

          // Fall Box
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(headX - 25, cy + 10, 140, 50);
      } else {
          // Walking Pose
          const headX = cx;
          const headY = cy - 80 + Math.sin(t*5)*5; // Bobbing
          const hipY = cy - 20;
          
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(headX, hipY); // Spine
          ctx.stroke();
          
          // Head
          ctx.beginPath();
          ctx.arc(headX, headY - 15, 10, 0, Math.PI*2);
          ctx.stroke();

          // Legs (Walking cycle)
          const lLeg = Math.sin(t * 5) * 20;
          const rLeg = Math.cos(t * 5) * 20;
          
          ctx.beginPath();
          ctx.moveTo(headX, hipY);
          ctx.lineTo(headX + lLeg, cy + 50);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(headX, hipY);
          ctx.lineTo(headX - lLeg, cy + 50);
          ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active, isFall]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-contain" />;
};

// PPE Visualizer Component
const PPEVisualizer = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 400, 300);
      const t = Date.now() / 1000;

      // Mock Workers
      const workers = [
        { x: 100 + Math.sin(t) * 10, y: 150, hasHelmet: true, hasVest: true },
        { x: 250 - Math.sin(t * 0.8) * 10, y: 140, hasHelmet: false, hasVest: true }, // Violation
      ];

      workers.forEach(w => {
        // Bounding Box
        ctx.strokeStyle = w.hasHelmet && w.hasVest ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, 60, 120);

        // Header Label
        ctx.fillStyle = w.hasHelmet && w.hasVest ? '#22c55e' : '#ef4444';
        ctx.fillRect(w.x, w.y - 20, 60, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(w.hasHelmet && w.hasVest ? 'PASS' : 'FAIL', w.x + 5, w.y - 6);

        // Missing Items Labels
        if (!w.hasHelmet) {
           ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
           ctx.fillRect(w.x, w.y + 125, 70, 15);
           ctx.fillStyle = '#fff';
           ctx.fillText('NO HELMET', w.x + 2, w.y + 136);
        }
      });

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-contain" />;
};

// Thermal/Fire Visualizer
const ThermalVisualizer = ({ active, temp }: { active: boolean, temp: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 400, 300);
      
      // Simulate Heat Map Overlay
      const t = Date.now() / 500;
      
      // Hotspot center
      const hx = 200;
      const hy = 150;
      
      // Create gradient for heat
      const radius = 50 + (temp > 50 ? (temp - 50) * 2 : 0) + Math.sin(t) * 5;
      const gradient = ctx.createRadialGradient(hx, hy, 5, hx, hy, radius);
      
      if (temp > 70) {
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)'); // Core hot
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 165, 0, 0.6)'); // Warm
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);

      // Draw Temp Text on hotspot
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${temp.toFixed(1)}°C`, hx - 20, hy);

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active, temp]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-contain mix-blend-screen" />;
};

const SafetyFire: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FALL' | 'PPE' | 'FIRE'>('FALL');
  const [fallEvents, setFallEvents] = useState<BehaviorEvent[]>([]);
  const [selectedFall, setSelectedFall] = useState<BehaviorEvent | null>(null);
  
  // Settings State
  const [fallConfig, setFallConfig] = useState({
      sensitivity: 'HIGH',
      timer: 10,
      autoCall: true
  });

  // PPE & Fire State
  const [ppeViolations, setPpeViolations] = useState<{id:string, item:string, workerId:string, time:Date}[]>([]);
  const [fireMetrics, setFireMetrics] = useState({ temp: 35, smoke: 12, status: 'NORMAL' });
  const [fireHistory, setFireHistory] = useState<any[]>([]);

  useEffect(() => {
    // Generate events, filter for FALL for the demo
    const all = generateBehaviorEvents(10);
    const falls = all.filter(e => e.type === 'FALL');
    setFallEvents(falls);
    if (falls.length > 0) setSelectedFall(falls[0]);

    // Mock PPE Data
    setPpeViolations([
      { id: 'v1', item: 'NO HELMET', workerId: 'W-104', time: new Date() },
      { id: 'v2', item: 'NO VEST', workerId: 'W-092', time: new Date(Date.now() - 300000) },
    ]);

    // Live Fire Simulation
    const interval = setInterval(() => {
      setFireMetrics(prev => {
        const newTemp = Math.max(25, Math.min(150, prev.temp + (Math.random() - 0.45) * 5));
        const newSmoke = Math.max(0, Math.min(100, prev.smoke + (Math.random() - 0.5) * 3));
        const status = newTemp > 70 || newSmoke > 50 ? 'CRITICAL' : newTemp > 50 ? 'WARNING' : 'NORMAL';
        
        setFireHistory(hist => [...hist, { time: new Date().toLocaleTimeString(), temp: newTemp, smoke: newSmoke }].slice(-20));
        
        return { temp: newTemp, smoke: newSmoke, status };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = (action: string) => {
      alert(`Action Triggered: ${action}`);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className={activeTab === 'FALL' ? 'text-red-500' : activeTab === 'PPE' ? 'text-blue-500' : 'text-orange-500'} />
            ความปลอดภัยและอัคคีภัย (Safety & Hazard)
          </h1>
          <p className="text-slate-400 mt-1">ระบบตรวจจับคนล้ม, การสวมใส่อุปกรณ์ PPE, และตรวจจับควันไฟแบบเรียลไทม์</p>
        </div>
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
           <button 
             onClick={() => setActiveTab('FALL')}
             className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'FALL' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <PersonStanding size={16} /> ตรวจจับคนล้ม
           </button>
           <button 
             onClick={() => setActiveTab('PPE')}
             className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'PPE' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <HardHat size={16} /> ชุด PPE
           </button>
           <button 
             onClick={() => setActiveTab('FIRE')}
             className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'FIRE' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             <Flame size={16} /> ไฟ & ควัน
           </button>
        </div>
      </div>

      {activeTab === 'FALL' && (
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Left: Main Visualizer */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="relative flex-1 bg-black rounded-xl border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)] overflow-hidden group">
                    {/* Simulated Camera Feed */}
                    <img src={selectedFall?.thumbnailUrl || 'https://placehold.co/800x450/000/FFF'} className="w-full h-full object-cover opacity-40" />
                    
                    {/* Skeleton Overlay */}
                    <div className="absolute inset-0">
                        <FallSkeletonVisualizer active={true} isFall={true} />
                    </div>

                    {/* HUD Overlay */}
                    <div className="absolute top-4 left-4 p-4 bg-red-950/80 backdrop-blur border border-red-500/50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">พบคนล้ม</h2>
                        </div>
                        <div className="space-y-1 text-sm font-mono text-red-200">
                            <div>ความเร็ว: {selectedFall?.metadata?.fallMeta?.impactVelocity || 2.1} m/s</div>
                            <div>ท่าทาง: นอนราบ (LYING_FLAT)</div>
                            <div>เวลาแน่นิ่ง: <span className="text-white font-bold text-lg">{selectedFall?.metadata?.poseData?.lyingDuration || 12} วินาที</span></div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                        <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 animate-pulse" onClick={() => handleAction('CALL_1669')}>
                            <PhoneCall size={20} /> โทรเรียกรถพยาบาล (1669)
                        </button>
                        <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 border border-slate-600" onClick={() => handleAction('AUDIO_TALK')}>
                            <Volume2 size={20} /> พูดคุยผ่านลำโพง
                        </button>
                    </div>
                </div>

                {/* Timeline Strip */}
                <div className="h-40 glass-panel p-4 rounded-xl border border-slate-700 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">ไทม์ไลน์ก่อนเกิดเหตุ</h3>
                    <div className="flex-1 flex items-center justify-between relative px-6">
                        <div className="absolute left-0 right-0 h-1 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
                        
                        {/* Steps */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full mb-2"></div>
                            <span className="text-[10px] text-slate-500">เดินปกติ</span>
                            <span className="text-[9px] text-slate-600">-10s</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full mb-2"></div>
                            <span className="text-[10px] text-slate-500">เสียหลัก</span>
                            <span className="text-[9px] text-slate-600">-2s</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-6 h-6 bg-red-500 rounded-full mb-2 border-4 border-slate-950 shadow"></div>
                            <span className="text-[10px] text-red-400 font-bold">กระแทก</span>
                            <span className="text-[9px] text-red-500">0s</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-4 h-4 bg-red-500/50 rounded-full mb-2 animate-pulse"></div>
                            <span className="text-[10px] text-slate-500">ไม่มีการเคลื่อนไหว</span>
                            <span className="text-[9px] text-slate-600">+5s</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-4 h-4 bg-red-500/50 rounded-full mb-2 animate-pulse"></div>
                            <span className="text-[10px] text-slate-500">แจ้งเตือนแล้ว</span>
                            <span className="text-[9px] text-slate-600">+10s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Sidebar */}
            <div className="w-80 flex flex-col gap-4">
                {/* Event List */}
                <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="font-bold text-white">ประวัติคนล้ม</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {fallEvents.map(evt => (
                            <div 
                                key={evt.id} 
                                onClick={() => setSelectedFall(evt)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedFall?.id === evt.id ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <span className="text-sm font-bold text-slate-200">ตรวจพบคนล้ม</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500">{evt.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                                    {evt.cameraName} • Conf: {(evt.confidence*100).toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Config Card */}
                <div className="glass-panel p-4 rounded-xl border border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Settings size={12}/> ตั้งค่านโยบาย</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>ความไว (Sensitivity)</span>
                                <span className="text-red-400 font-bold">{fallConfig.sensitivity}</span>
                            </div>
                            <div className="flex gap-1">
                                {['LOW', 'MED', 'HIGH'].map(l => (
                                    <button 
                                        key={l} 
                                        onClick={() => setFallConfig({...fallConfig, sensitivity: l})}
                                        className={`flex-1 py-1 text-[9px] rounded border ${fallConfig.sensitivity === l ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>เวลาอยู่นิ่ง (Lying Threshold)</span>
                                <span>{fallConfig.timer}s</span>
                            </div>
                            <input 
                                type="range" min="3" max="60" 
                                value={fallConfig.timer} 
                                onChange={(e) => setFallConfig({...fallConfig, timer: parseInt(e.target.value)})}
                                className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-red-500"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-300">โทรออกฉุกเฉินอัตโนมัติ</span>
                            <input 
                                type="checkbox" 
                                checked={fallConfig.autoCall} 
                                onChange={(e) => setFallConfig({...fallConfig, autoCall: e.target.checked})}
                                className="accent-red-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ACTIVE TAB: PPE DETECTION */}
      {activeTab === 'PPE' && (
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Visualizer */}
            <div className="flex-1 relative bg-black rounded-xl border border-blue-500/30 overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0">
                  <PPEVisualizer active={true} />
               </div>
               <div className="absolute top-4 left-4 bg-blue-900/80 backdrop-blur px-4 py-2 rounded-lg border border-blue-500/50">
                  <h3 className="text-white font-bold flex items-center gap-2"><HardHat size={18}/> PPE Monitoring Active</h3>
                  <p className="text-xs text-blue-200 mt-1">Detecting: Helmet, Safety Vest</p>
               </div>
            </div>

            {/* Right Panel */}
            <div className="w-80 flex flex-col gap-4">
               {/* Stats */}
               <div className="glass-panel p-4 rounded-xl border border-slate-700 flex justify-between items-center bg-slate-900/50">
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-bold">Compliance Rate</div>
                     <div className="text-3xl font-bold text-green-400">92%</div>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-green-500 flex items-center justify-center text-xs font-bold text-white bg-green-900/20">
                     A+
                  </div>
               </div>

               {/* Violations Log */}
               <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                     <span className="text-xs font-bold text-white uppercase">Violations Log</span>
                     <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded">{ppeViolations.length} New</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                     {ppeViolations.map(v => (
                        <div key={v.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex gap-3 items-center hover:border-red-500/50 transition-colors cursor-pointer group">
                           <div className="p-2 bg-red-900/20 text-red-500 rounded"><AlertOctagon size={16}/></div>
                           <div className="flex-1">
                              <div className="text-xs font-bold text-slate-200">{v.item} MISSING</div>
                              <div className="text-[10px] text-slate-500">ID: {v.workerId} • {v.time.toLocaleTimeString()}</div>
                           </div>
                           <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                        </div>
                     ))}
                  </div>
               </div>

               {/* Config */}
               <div className="glass-panel p-4 rounded-xl border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Detection Rules</h4>
                  <div className="space-y-2">
                     <label className="flex items-center justify-between text-xs text-slate-300 p-2 bg-slate-800 rounded cursor-pointer">
                        <span>Helmet (หมวกนิรภัย)</span>
                        <input type="checkbox" defaultChecked className="accent-blue-500"/>
                     </label>
                     <label className="flex items-center justify-between text-xs text-slate-300 p-2 bg-slate-800 rounded cursor-pointer">
                        <span>Safety Vest (เสื้อสะท้อนแสง)</span>
                        <input type="checkbox" defaultChecked className="accent-blue-500"/>
                     </label>
                     <label className="flex items-center justify-between text-xs text-slate-300 p-2 bg-slate-800 rounded cursor-pointer">
                        <span>Gloves (ถุงมือ)</span>
                        <input type="checkbox" className="accent-blue-500"/>
                     </label>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* ACTIVE TAB: FIRE SAFETY */}
      {activeTab === 'FIRE' && (
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Thermal Monitor */}
            <div className="flex-1 relative bg-black rounded-xl border border-orange-500/30 overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1542317854-f9596af56dc8?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0">
                  <ThermalVisualizer active={true} temp={fireMetrics.temp} />
               </div>
               
               {/* Metrics Overlay */}
               <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className={`px-4 py-2 rounded-lg backdrop-blur border flex items-center gap-3 ${fireMetrics.status === 'CRITICAL' ? 'bg-red-900/80 border-red-500 text-white animate-pulse' : fireMetrics.status === 'WARNING' ? 'bg-orange-900/80 border-orange-500 text-white' : 'bg-green-900/80 border-green-500 text-white'}`}>
                     <Thermometer size={24} />
                     <div>
                        <div className="text-2xl font-bold font-mono">{fireMetrics.temp.toFixed(1)}°C</div>
                        <div className="text-[10px] uppercase font-bold opacity-80">Max Temp</div>
                     </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700 flex items-center gap-3 text-slate-200">
                     <Wind size={24} />
                     <div>
                        <div className="text-2xl font-bold font-mono">{fireMetrics.smoke.toFixed(1)}%</div>
                        <div className="text-[10px] uppercase font-bold opacity-80">Smoke Level</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Panel */}
            <div className="w-80 flex flex-col gap-4">
               {/* Graph */}
               <div className="h-48 glass-panel p-4 rounded-xl border border-slate-700 flex flex-col">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Temperature Trend</h3>
                  <div className="flex-1 w-full min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fireHistory}>
                           <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px'}} />
                           <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#colorTemp)" isAnimationActive={false} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Alert Status */}
               <div className={`p-4 rounded-xl border flex items-center gap-4 ${fireMetrics.status === 'NORMAL' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                  <div className={`p-3 rounded-full ${fireMetrics.status === 'NORMAL' ? 'bg-green-500/20 text-green-500' : 'bg-red-500 text-white animate-bounce'}`}>
                     {fireMetrics.status === 'NORMAL' ? <ShieldCheck size={24}/> : <BellRing size={24}/>}
                  </div>
                  <div>
                     <div className="text-sm font-bold text-white">{fireMetrics.status === 'NORMAL' ? 'System Normal' : 'HAZARD DETECTED'}</div>
                     <div className="text-xs text-slate-400">{fireMetrics.status === 'NORMAL' ? 'No fire signatures detected.' : 'Immediate action required.'}</div>
                  </div>
               </div>

               {/* Controls */}
               <div className="flex-1 glass-panel p-4 rounded-xl border border-slate-700">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Emergency Controls</h3>
                  <div className="space-y-3">
                     <button 
                        onClick={() => handleAction('TRIGGER_ALARM')}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
                     >
                        <Siren size={18} /> TRIGGER ALARM
                     </button>
                     <button 
                        onClick={() => handleAction('ACTIVATE_SPRINKLERS')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
                     >
                        <Droplets size={18} /> ACTIVATE SPRINKLERS
                     </button>
                     <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                        <PhoneCall size={18} /> Contact Fire Dept.
                     </button>
                  </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SafetyFire;
