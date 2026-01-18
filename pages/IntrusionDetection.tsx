
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, MousePointer2, Settings, Activity, PlayCircle, Plus, Trash2, 
  AlertTriangle, ShieldAlert, Check, X, Move
} from 'lucide-react';
import { MOCK_CAMERAS } from '../constants';
import { Point, IntrusionZone, Camera } from '../types';

const IntrusionDetection: React.FC = () => {
  // Safe initialization even if MOCK_CAMERAS is empty
  const [activeCamera, setActiveCamera] = useState<Camera | null>(MOCK_CAMERAS.length > 0 ? MOCK_CAMERAS[0] : null);
  const [mode, setMode] = useState<'VIEW' | 'DRAW_POLY' | 'DRAW_LINE' | 'TEST'>('VIEW');
  
  // Zones State
  const [zones, setZones] = useState<IntrusionZone[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Test Simulation State
  const [simObjects, setSimObjects] = useState<{id: string, x: number, y: number, color: string}[]>([]);

  // Canvas Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Check if we have cameras from localStorage if MOCK is empty
  useEffect(() => {
      if (!activeCamera) {
          const savedCams = localStorage.getItem('visionguard_cameras');
          if (savedCams) {
              const parsed = JSON.parse(savedCams);
              if (parsed.length > 0) {
                  setActiveCamera(parsed[0]);
              }
          }
      }
  }, []);

  useEffect(() => {
    // Live Simulation Loop
    if (mode === 'TEST') {
      const interval = setInterval(() => {
        setSimObjects(prev => {
          // Simple bouncing logic
          if (prev.length < 3) {
             return [...prev, {
                id: Math.random().toString(36).substr(2,5),
                x: Math.random() * 100,
                y: Math.random() * 100,
                color: Math.random() > 0.5 ? '#22d3ee' : '#f472b6' // Cyan (Person) or Pink (Vehicle)
             }];
          }
          return prev.map(obj => ({
             ...obj,
             x: (obj.x + (Math.random() - 0.5) * 2 + 100) % 100,
             y: (obj.y + (Math.random() - 0.5) * 2 + 100) % 100
          }));
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setSimObjects([]);
    }
  }, [mode]);

  // --- Handlers ---

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode === 'VIEW' || mode === 'TEST') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mode === 'DRAW_POLY' || mode === 'DRAW_LINE') {
       setCurrentPoints([...currentPoints, { x, y }]);
    }
  };

  const finalizeZone = () => {
    if (currentPoints.length < 2) return;
    
    const newZone: IntrusionZone = {
      id: `zone-${Date.now()}`,
      label: `Zone ${zones.length + 1}`,
      shape: mode === 'DRAW_LINE' ? 'LINE' : 'POLYGON',
      points: currentPoints,
      type: 'WARNING',
      isActive: true,
      color: mode === 'DRAW_LINE' ? '#facc15' : '#ef4444', // Yellow for line, Red for poly default
      rules: {
        minDuration: 1,
        classes: ['PERSON'],
        schedule: 'Always',
        direction: 'BOTH'
      }
    };

    setZones([...zones, newZone]);
    setCurrentPoints([]);
    setMode('VIEW');
    setSelectedZoneId(newZone.id);
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  const updateZoneRule = (key: string, value: any) => {
    if (!selectedZoneId) return;
    setZones(zones.map(z => 
      z.id === selectedZoneId 
        ? { ...z, rules: { ...z.rules, [key]: value } }
        : z
    ));
  };

  const updateZoneType = (type: 'WARNING' | 'RESTRICTED') => {
    if (!selectedZoneId) return;
    setZones(zones.map(z => 
      z.id === selectedZoneId 
        ? { ...z, type, color: type === 'RESTRICTED' ? '#ef4444' : '#facc15' }
        : z
    ));
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  // --- EMPTY STATE HANDLER ---
  if (!activeCamera) {
      return (
          <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-slate-500 font-sans animate-fade-in">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert size={40} className="opacity-50 text-slate-400"/>
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">No Cameras Configured</h2>
              <p className="mb-6 max-w-md text-center">Please add a camera device in Settings to enable Intrusion Detection and Virtual Fencing.</p>
              <a href="#/settings" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold transition-colors">
                  Go to Settings
              </a>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-red-500" /> ป้องกันการบุกรุก (Intrusion Defense)
          </h1>
          <p className="text-slate-400 mt-1">กำหนดพื้นที่เสมือน (Virtual Fences) และเขตหวงห้ามพร้อมระบบตรวจจับทิศทาง</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">ARMED</span>
           </div>
           {/* Safe Select Render */}
           <select 
             className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
             value={activeCamera.id}
             onChange={(e) => {
                 // Try to find in MOCK first, then maybe local storage (not implemented here for simplicity, assuming MOCK covers connected state)
                 const cam = MOCK_CAMERAS.find(c => c.id === e.target.value) || activeCamera;
                 setActiveCamera(cam);
             }}
           >
             {MOCK_CAMERAS.length > 0 ? (
                 MOCK_CAMERAS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
             ) : (
                 <option value={activeCamera.id}>{activeCamera.name}</option>
             )}
           </select>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* LEFT: Zone List & Controls */}
        <div className="w-80 flex flex-col gap-4">
           {/* Toolbox */}
           <div className="glass-panel p-4 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">เครื่องมือวาด</h3>
              <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => setMode('DRAW_POLY')}
                   className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${mode === 'DRAW_POLY' ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                 >
                    <ShieldAlert size={20} />
                    <span className="text-[10px] font-bold">พื้นที่ (Polygon)</span>
                 </button>
                 <button 
                   onClick={() => setMode('DRAW_LINE')}
                   className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${mode === 'DRAW_LINE' ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                 >
                    <Move size={20} />
                    <span className="text-[10px] font-bold">เส้นกั้น (Tripwire)</span>
                 </button>
              </div>
              
              {currentPoints.length > 0 && (
                 <div className="flex gap-2 animate-fade-in">
                    <button onClick={() => setCurrentPoints([])} className="flex-1 py-2 bg-slate-800 rounded text-xs text-slate-300 hover:text-white border border-slate-700">ยกเลิก</button>
                    <button onClick={finalizeZone} className="flex-1 py-2 bg-green-600 rounded text-xs text-white hover:bg-green-500 font-bold flex items-center justify-center gap-1">
                       <Check size={14} /> เสร็จสิ้น
                    </button>
                 </div>
              )}
           </div>

           {/* Zones List */}
           <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase">โซนที่ใช้งาน</span>
                 <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{zones.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {zones.map(zone => (
                    <div 
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedZoneId === zone.id ? 'bg-slate-800 border-slate-500 ring-1 ring-slate-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full border-2 border-slate-900`} style={{ backgroundColor: zone.color }}></div>
                          <div>
                             <div className="text-sm font-bold text-slate-200">{zone.label}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{zone.type} • {zone.shape}</div>
                          </div>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); deleteZone(zone.id); }}
                         className="text-slate-600 hover:text-red-400 p-1"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 ))}
                 {zones.length === 0 && (
                    <div className="text-center p-8 text-slate-600 text-xs">
                       ยังไม่มีการกำหนดโซน<br/>ใช้เครื่องมือด้านบนเพื่อวาด
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* CENTER: Editor Canvas */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
           {/* Canvas Container */}
           <div className="relative flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl group">
              {/* Background Video/Image */}
              <img 
                src={activeCamera.url} 
                className="w-full h-full object-cover opacity-60 pointer-events-none select-none" 
              />
              
              {/* Interactive SVG Layer */}
              <svg 
                ref={svgRef}
                className={`absolute inset-0 w-full h-full z-10 ${mode.startsWith('DRAW') ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleCanvasClick}
              >
                 {/* Existing Zones */}
                 {zones.map(zone => (
                    <g 
                      key={zone.id} 
                      className={`transition-opacity ${selectedZoneId && selectedZoneId !== zone.id ? 'opacity-40' : 'opacity-100'}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedZoneId(zone.id); }}
                    >
                       {zone.shape === 'POLYGON' ? (
                          <polygon 
                             points={zone.points.map(p => `${p.x}%,${p.y}%`).join(' ')} 
                             fill={zone.color} 
                             fillOpacity="0.2" 
                             stroke={zone.color} 
                             strokeWidth="2"
                             className="hover:stroke-white transition-colors cursor-pointer"
                          />
                       ) : (
                          <line 
                             x1={`${zone.points[0].x}%`} y1={`${zone.points[0].y}%`} 
                             x2={`${zone.points[1].x}%`} y2={`${zone.points[1].y}%`} 
                             stroke={zone.color} 
                             strokeWidth="4"
                             className="hover:stroke-white transition-colors cursor-pointer"
                          />
                       )}
                       
                       {/* Labels */}
                       <rect 
                         x={`${zone.points[0].x}%`} y={`${zone.points[0].y - 3}%`} 
                         width="60" height="16" 
                         fill={zone.color} 
                         rx="4"
                       />
                       <text 
                         x={`${zone.points[0].x + 2}%`} y={`${zone.points[0].y - 1}%`} 
                         fill="black" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                       >
                          {zone.label}
                       </text>
                    </g>
                 ))}

                 {/* Drawing in Progress */}
                 {currentPoints.length > 0 && (
                    <g>
                       {mode === 'DRAW_POLY' && currentPoints.length > 1 && (
                          <polyline 
                             points={currentPoints.map(p => `${p.x}%,${p.y}%`).join(' ')} 
                             fill="none" 
                             stroke="#3b82f6" 
                             strokeWidth="2" 
                             strokeDasharray="5,5"
                          />
                       )}
                       {mode === 'DRAW_LINE' && currentPoints.length > 0 && currentPoints.length < 2 && (
                          <circle cx={`${currentPoints[0].x}%`} cy={`${currentPoints[0].y}%`} r="4" fill="#facc15" />
                       )}
                       {currentPoints.map((p, i) => (
                          <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="white" stroke="#3b82f6" strokeWidth="1" />
                       ))}
                    </g>
                 )}

                 {/* Simulation Objects */}
                 {simObjects.map(obj => (
                    <circle key={obj.id} cx={`${obj.x}%`} cy={`${obj.y}%`} r="6" fill={obj.color} stroke="white" strokeWidth="2" />
                 ))}
              </svg>

              {/* Overlay Hints */}
              <div className="absolute top-4 left-4 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white flex items-center gap-2">
                    {mode === 'VIEW' && <><MousePointer2 size={14}/> เลือกโซนเพื่อแก้ไข</>}
                    {mode === 'DRAW_POLY' && <><Plus size={14}/> คลิกเพื่อเพิ่มจุด</>}
                    {mode === 'DRAW_LINE' && <><Move size={14}/> คลิกจุดเริ่มต้นและสิ้นสุด</>}
                    {mode === 'TEST' && <><PlayCircle size={14} className="text-green-400"/> กำลังจำลองเหตุการณ์...</>}
                 </div>
              </div>
           </div>

           {/* Bottom Bar: Quick Test */}
           <div className="h-16 bg-slate-900 rounded-xl border border-slate-700 flex items-center px-4 justify-between">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setMode(mode === 'TEST' ? 'VIEW' : 'TEST')}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${mode === 'TEST' ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                 >
                    {mode === 'TEST' ? 'หยุดจำลอง' : 'ทดสอบระบบ'}
                 </button>
                 <div className="h-8 w-px bg-slate-700"></div>
                 <div className="text-xs text-slate-400">
                    AI Sensitivity: <span className="text-white font-bold">85%</span>
                 </div>
              </div>
              <button className="text-xs text-primary-400 hover:underline">ตั้งค่า AI ขั้นสูง</button>
           </div>
        </div>

        {/* RIGHT: Properties Panel */}
        {selectedZone ? (
           <div className="w-80 flex flex-col gap-4 animate-fade-in">
              <div className="glass-panel p-5 rounded-xl border border-slate-700 bg-slate-900/50">
                 <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                    <div className="p-2 rounded bg-slate-800 text-slate-300">
                       <Settings size={20} />
                    </div>
                    <div>
                       <input 
                         className="bg-transparent text-sm font-bold text-white outline-none w-full"
                         value={selectedZone.label}
                         onChange={(e) => setZones(zones.map(z => z.id === selectedZone.id ? {...z, label: e.target.value} : z))}
                       />
                       <div className="text-[10px] text-slate-500 font-mono">{selectedZone.id}</div>
                    </div>
                 </div>

                 {/* Zone Type */}
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">ระดับความปลอดภัย</label>
                       <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => updateZoneType('WARNING')}
                            className={`py-2 rounded text-xs font-bold border transition-all ${selectedZone.type === 'WARNING' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                          >
                             เฝ้าระวัง (Warning)
                          </button>
                          <button 
                            onClick={() => updateZoneType('RESTRICTED')}
                            className={`py-2 rounded text-xs font-bold border transition-all ${selectedZone.type === 'RESTRICTED' ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                          >
                             เขตหวงห้าม (Restricted)
                          </button>
                       </div>
                    </div>

                    {/* Schedule */}
                    <div>
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">เวลาทำงาน</label>
                       <select 
                         className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none"
                         value={selectedZone.rules.schedule}
                         onChange={(e) => updateZoneRule('schedule', e.target.value)}
                       >
                          <option>ตลอดเวลา (24/7)</option>
                          <option>เฉพาะกลางคืน (20:00 - 06:00)</option>
                          <option>เวลางาน (08:00 - 18:00)</option>
                       </select>
                    </div>

                    {/* Object Class */}
                    <div>
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">วัตถุเป้าหมาย</label>
                       <div className="flex gap-2">
                          {['PERSON', 'VEHICLE'].map(cls => (
                             <button 
                               key={cls}
                               className={`px-3 py-1 rounded text-[10px] font-bold border ${selectedZone.rules.classes.includes(cls) ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                               onClick={() => {
                                  const newClasses = selectedZone.rules.classes.includes(cls)
                                     ? selectedZone.rules.classes.filter(c => c !== cls)
                                     : [...selectedZone.rules.classes, cls];
                                  updateZoneRule('classes', newClasses);
                               }}
                             >
                                {cls}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Thresholds */}
                    <div>
                       <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>เวลาขั้นต่ำ (Min Duration)</span>
                          <span className="text-white">{selectedZone.rules.minDuration}s</span>
                       </div>
                       <input 
                         type="range" min="0" max="10" step="0.5"
                         value={selectedZone.rules.minDuration}
                         onChange={(e) => updateZoneRule('minDuration', parseFloat(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                       />
                    </div>
                 </div>
              </div>

              {/* Alert Preview */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${selectedZone.type === 'RESTRICTED' ? 'bg-red-900/10 border-red-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                 <AlertTriangle size={20} className={selectedZone.type === 'RESTRICTED' ? 'text-red-500' : 'text-yellow-500'} />
                 <div>
                    <h4 className={`text-xs font-bold ${selectedZone.type === 'RESTRICTED' ? 'text-red-400' : 'text-yellow-400'}`}>
                       {selectedZone.type === 'RESTRICTED' ? 'แจ้งเตือนวิกฤต' : 'แจ้งเตือนทั่วไป'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                       {selectedZone.type === 'RESTRICTED' 
                          ? 'เปิดไซเรนทันที และส่งแจ้งเตือนด่วนถึงหัวหน้า รปภ.' 
                          : 'บันทึกเหตุการณ์ลงฐานข้อมูล และแจ้งเตือนหน้าจอผู้ควบคุม'}
                    </p>
                 </div>
              </div>
           </div>
        ) : (
           <div className="w-80 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
              <Settings size={32} className="opacity-20 mb-2"/>
              <span className="text-xs">เลือกโซนเพื่อตั้งค่า</span>
           </div>
        )}

      </div>
    </div>
  );
};

export default IntrusionDetection;
