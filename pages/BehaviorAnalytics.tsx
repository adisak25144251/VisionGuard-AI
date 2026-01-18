
import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Users, Activity, Play, Pause, ChevronRight, 
  Settings, UserPlus, AlertTriangle, Clock, Layers, Maximize2,
  GitCommit, Footprints, PackageX, Zap, Siren, Volume2
} from 'lucide-react';
import { generateBehaviorEvents } from '../services/mockAiService';
import { BehaviorEvent } from '../types';

// Visual Mock Component for Skeleton
const SkeletonVisualizer = ({ active, type, violenceScore }: { active: boolean, type: string, violenceScore?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 320, 240);
      
      const t = Date.now() / 300;
      
      if (type === 'FIGHT') {
          // Draw Two People interacting aggressively
          
          // Person A (Aggressor) - Left
          const headAX = 120 + Math.sin(t*3)*15; // Jerky motion
          const headAY = 100;
          
          ctx.strokeStyle = '#ef4444'; // Red
          ctx.lineWidth = 3;
          
          // Body A
          ctx.beginPath(); ctx.arc(headAX, headAY, 8, 0, Math.PI*2); ctx.stroke(); // Head
          ctx.beginPath(); ctx.moveTo(headAX, headAY+8); ctx.lineTo(headAX, headAY+60); ctx.stroke(); // Spine
          
          // Punching Arm A
          ctx.beginPath(); 
          ctx.moveTo(headAX, headAY+20); 
          ctx.lineTo(headAX + 30 + Math.abs(Math.sin(t*5)*30), headAY+10); // Punch out
          ctx.stroke();

          // Person B (Victim) - Right
          const headBX = 200 - Math.sin(t*3)*10;
          const headBY = 100 + Math.sin(t*5)*5; // Recoil
          
          ctx.strokeStyle = '#facc15'; // Yellow
          
          // Body B
          ctx.beginPath(); ctx.arc(headBX, headBY, 8, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headBX, headBY+8); ctx.lineTo(headBX+5, headBY+60); ctx.stroke();
          
          // Defending Arms B
          ctx.beginPath();
          ctx.moveTo(headBX, headBY+20);
          ctx.lineTo(headBX-20, headBY+10); // Block
          ctx.stroke();

          // Interaction Line (The "Heat" of the fight)
          if ((violenceScore || 0) > 60) {
             ctx.beginPath();
             ctx.moveTo(headAX + 20, headAY+20);
             ctx.lineTo(headBX - 10, headBY+20);
             ctx.strokeStyle = `rgba(255, 0, 0, ${Math.abs(Math.sin(t*10))})`; // Pulsing red line
             ctx.lineWidth = 5;
             ctx.stroke();
          }

      } else {
          // Default Single Person (Walking/Falling)
          const headX = 160 + Math.sin(t) * 20;
          const headY = 60 + Math.abs(Math.sin(t*2)) * 10;
          
          ctx.strokeStyle = type === 'FALL' ? '#f97316' : '#22d3ee';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath(); ctx.arc(headX, headY, 10, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headX, headY + 10); ctx.lineTo(headX, headY + 80); ctx.stroke();
          
          // Arms
          ctx.beginPath(); ctx.moveTo(headX, headY + 30); ctx.lineTo(headX - 30, headY + 50 + Math.sin(t*3)*20); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headX, headY + 30); ctx.lineTo(headX + 30, headY + 50 + Math.cos(t*3)*20); ctx.stroke();
          
          // Legs
          ctx.beginPath(); ctx.moveTo(headX, headY + 80); ctx.lineTo(headX - 20, headY + 140); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headX, headY + 80); ctx.lineTo(headX + 20, headY + 140); ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active, type, violenceScore]);

  return <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-cover opacity-80" />;
};

const ViolenceGauge = ({ score }: { score: number }) => {
    const color = score > 85 ? 'text-red-500' : score > 60 ? 'text-orange-500' : 'text-yellow-500';
    return (
        <div className="relative w-32 h-16 overflow-hidden">
            <div className="absolute bottom-0 w-full h-full bg-slate-800 rounded-t-full"></div>
            <div 
                className={`absolute bottom-0 w-full h-full ${score > 85 ? 'bg-red-500' : score > 60 ? 'bg-orange-500' : 'bg-yellow-500'} rounded-t-full origin-bottom transition-all duration-500`}
                style={{ transform: `rotate(${(score / 100) * 180 - 180}deg)` }}
            ></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-slate-900 rounded-t-full flex items-end justify-center pb-2">
                <span className={`text-2xl font-bold ${color}`}>{score}</span>
            </div>
        </div>
    );
};

const BehaviorAnalytics: React.FC = () => {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<BehaviorEvent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Settings
  const [sensitivity, setSensitivity] = useState(75);
  const [jerkThreshold, setJerkThreshold] = useState(12);
  const [alertLevel, setAlertLevel] = useState(1);

  useEffect(() => {
    const data = generateBehaviorEvents(15);
    setEvents(data);
    setSelectedEvent(data[0]);
  }, []);

  const getBehaviorIcon = (type: string) => {
    switch(type) {
        case 'FIGHT': return <Users size={16} className="text-red-400" />;
        case 'FALL': return <Activity size={16} className="text-orange-400" />;
        case 'TAILGATING': return <GitCommit size={16} className="text-yellow-400" />;
        case 'ABANDONED_OBJ': return <PackageX size={16} className="text-purple-400" />;
        case 'SUSPICIOUS_ROAMING': return <Footprints size={16} className="text-blue-400" />;
        default: return <BrainCircuit size={16} />;
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="text-primary-400" /> Behavior Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Deep Learning Analysis for Complex Human Actions & Interactions</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:text-white border border-slate-700">
              <Settings size={16}/> Config
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left: Event List */}
        <div className="w-80 flex flex-col gap-4">
           {/* Filters */}
           <div className="glass-panel p-3 rounded-xl border border-slate-700">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                 {['ALL', 'FIGHT', 'FALL', 'OBJ', 'ROAM'].map(f => (
                    <button key={f} className={`px-3 py-1 text-[10px] font-bold rounded border hover:text-white whitespace-nowrap ${f === 'FIGHT' ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                       {f}
                    </button>
                 ))}
              </div>
           </div>

           {/* List */}
           <div className="flex-1 glass-panel rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {events.map(evt => (
                 <div 
                   key={evt.id} 
                   onClick={() => setSelectedEvent(evt)}
                   className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${selectedEvent?.id === evt.id ? 'bg-primary-900/20 border-primary-500' : 'bg-slate-900/50 border-slate-800'}`}
                 >
                    <div className="flex justify-between items-start mb-1">
                       <div className="flex items-center gap-2 font-bold text-xs text-white">
                          <div className={`p-1.5 rounded border ${evt.type === 'FIGHT' ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
                             {getBehaviorIcon(evt.type)}
                          </div>
                          {evt.type.replace('_', ' ')}
                       </div>
                       <span className="text-[10px] text-slate-500">{evt.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                       <span>{evt.cameraName}</span>
                       <span className={`px-1.5 rounded ${evt.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-300' : 'bg-slate-800 text-slate-300'}`}>{evt.severity}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Center: Visualizer */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
           {selectedEvent ? (
              <>
                 <div className="flex-1 glass-panel rounded-xl border border-slate-700 relative overflow-hidden group bg-black">
                    {/* Main Video View */}
                    <div className="absolute inset-0 flex items-center justify-center">
                       {/* Background Image (Simulating Video) */}
                       <img 
                         src={selectedEvent.thumbnailUrl} 
                         className="w-full h-full object-cover opacity-60"
                       />
                       
                       {/* Skeleton Overlay */}
                       {showSkeleton && (
                          <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                             <SkeletonVisualizer active={true} type={selectedEvent.type} violenceScore={selectedEvent.metadata.violenceMeta?.violenceScore} />
                          </div>
                       )}

                       {/* Controls Overlay */}
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-primary-400">
                             {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                          </button>
                          <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full bg-primary-500 w-1/3"></div>
                          </div>
                          <button onClick={() => setShowSkeleton(!showSkeleton)} className={`text-xs font-bold ${showSkeleton ? 'text-primary-400' : 'text-slate-500'}`}>
                             SKELETON
                          </button>
                       </div>
                    </div>

                    {/* Metadata Overlay (Top Left) */}
                    <div className={`absolute top-4 left-4 p-3 backdrop-blur rounded-lg border text-xs ${selectedEvent.type === 'FIGHT' ? 'bg-red-950/80 border-red-500/50 text-red-100' : 'bg-black/80 border-slate-800 text-slate-300'}`}>
                       <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${selectedEvent.type === 'FIGHT' ? 'bg-red-500' : 'bg-primary-500'}`}></span>
                          <span className="font-bold uppercase">{selectedEvent.type} DETECTED</span>
                       </div>
                       <div className="space-y-1 font-mono opacity-80">
                          <div>CONF: {(selectedEvent.confidence * 100).toFixed(1)}%</div>
                          <div>DUR: {selectedEvent.metadata.durationSeconds}s</div>
                          <div>ACTORS: {selectedEvent.metadata.actors}</div>
                       </div>
                    </div>
                 </div>

                 {/* Timeline / Analysis Strip */}
                 <div className="h-48 glass-panel rounded-xl border border-slate-700 p-4 flex flex-col">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                       <Layers size={16} className="text-primary-400"/> Temporal Analysis
                    </h3>
                    <div className="flex-1 relative border-t border-slate-800 mt-2">
                        {/* Time Markers */}
                        <div className="absolute top-0 left-0 h-full w-px bg-red-500 z-10"></div>
                        
                        {/* Event Blocks */}
                        <div className="absolute top-4 left-10 w-32 h-8 bg-blue-900/30 border border-blue-500/50 rounded flex items-center justify-center text-[10px] text-blue-300">
                           Normal Movement
                        </div>
                        <div className="absolute top-4 left-44 w-12 h-8 bg-yellow-900/30 border border-yellow-500/50 rounded flex items-center justify-center text-[10px] text-yellow-300">
                           Sudden Jerk
                        </div>
                        <div className={`absolute top-4 left-60 w-48 h-8 rounded flex items-center justify-center text-[10px] animate-pulse border ${selectedEvent.type === 'FIGHT' ? 'bg-red-900/30 border-red-500/50 text-red-300' : 'bg-slate-800 border-slate-600'}`}>
                           {selectedEvent.type} ACTION
                        </div>
                        
                        <div className="absolute bottom-2 left-0 w-full text-[10px] text-slate-600 font-mono flex justify-between">
                           <span>T-5s</span>
                           <span>T-0s</span>
                           <span>T+5s</span>
                           <span>T+10s</span>
                        </div>
                    </div>
                 </div>
              </>
           ) : (
              <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500">
                 <BrainCircuit size={48} className="opacity-20 mb-4" />
                 <p>Select an event to visualize behavior analysis.</p>
              </div>
           )}
        </div>

        {/* Right: Config Panel */}
        <div className="w-80 flex flex-col gap-4">
           {selectedEvent?.type === 'FIGHT' && selectedEvent.metadata.violenceMeta ? (
               <div className="glass-panel p-6 rounded-xl border border-red-500/30 bg-red-950/20 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-[shimmer_2s_infinite]"></div>
                   <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-widest">Violence Score</h3>
                   <div className="flex justify-center my-4">
                       <ViolenceGauge score={selectedEvent.metadata.violenceMeta.violenceScore} />
                   </div>
                   <div className="text-xs text-red-300 mb-4">
                       Severity Level: <span className="font-bold text-white">{selectedEvent.severity}</span>
                   </div>
                   
                   {/* Escalation Controls */}
                   <div className="grid grid-cols-1 gap-2 border-t border-red-900/50 pt-4">
                       <p className="text-[10px] text-slate-400 mb-1 text-left uppercase font-bold">Response Protocol</p>
                       <button className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">
                           <span className="flex items-center gap-2"><Volume2 size={14}/> Warn (Audio)</span>
                           <span className="text-[10px] bg-slate-700 px-1 rounded">Lv.1</span>
                       </button>
                       <button className="flex items-center justify-between px-3 py-2 bg-orange-900/40 hover:bg-orange-900/60 rounded text-xs text-orange-200 border border-orange-900/50 transition-colors">
                           <span className="flex items-center gap-2"><AlertTriangle size={14}/> Notify Guard</span>
                           <span className="text-[10px] bg-orange-900/50 px-1 rounded">Lv.2</span>
                       </button>
                       <button className="flex items-center justify-between px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-xs text-white font-bold shadow-lg shadow-red-900/20 animate-pulse transition-colors">
                           <span className="flex items-center gap-2"><Siren size={14}/> POLICE / SIREN</span>
                           <span className="text-[10px] bg-red-800 px-1 rounded">Lv.3</span>
                       </button>
                   </div>
               </div>
           ) : (
               <div className="glass-panel p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                     <Settings size={16} /> Tuning Parameters
                  </h3>
                  
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Pose Sensitivity</span>
                           <span>{sensitivity}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={sensitivity} 
                          onChange={(e) => setSensitivity(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                     </div>
                     <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Jerk Threshold (m/s³)</span>
                           <span>{jerkThreshold}</span>
                        </div>
                        <input 
                          type="range" min="1" max="20" 
                          value={jerkThreshold} 
                          onChange={(e) => setJerkThreshold(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                     </div>
                     
                     <div className="pt-4 border-t border-slate-800 space-y-2">
                        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                           <span>Show Skeleton</span>
                           <input type="checkbox" checked={showSkeleton} onChange={(e) => setShowSkeleton(e.target.checked)} className="accent-primary-500" />
                        </label>
                        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                           <span>Crowd Filter</span>
                           <input type="checkbox" defaultChecked className="accent-primary-500" />
                        </label>
                     </div>
                  </div>
               </div>
           )}

           <div className="glass-panel p-4 rounded-xl border border-slate-700 flex-1 bg-slate-900/30">
              <h3 className="font-bold text-white text-sm mb-3">Logic Explanation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                 {selectedEvent ? selectedEvent.description : 'Select an event to see the AI reasoning logic.'}
              </p>
              {selectedEvent && (
                 <div className="mt-4 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-green-400">
                    <div>{`> Rule: ${selectedEvent.type}_DETECT`}</div>
                    <div>{`> Confidence: ${(selectedEvent.confidence * 100).toFixed(2)}%`}</div>
                    <div>{`> Temporal: Verified over ${selectedEvent.metadata.durationSeconds}s`}</div>
                    {selectedEvent.metadata.violenceMeta && (
                        <>
                            <div className="text-red-400">{`> Aggression: ${selectedEvent.metadata.violenceMeta.violenceScore}/100`}</div>
                            <div className="text-red-400">{`> Type: ${selectedEvent.metadata.violenceMeta.interactionType}`}</div>
                        </>
                    )}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default BehaviorAnalytics;
