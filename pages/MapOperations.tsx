
import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, Layers, Navigation, Crosshair, ZoomIn, ZoomOut, 
  AlertTriangle, Filter, Eye, Clock, ShieldAlert, Radio, Footprints,
  UserCheck, ArrowRight, X
} from 'lucide-react';
import { GeoCamera, GeoEvent, GeoZone, SuspectToken, SuspectProfile } from '../types';
import { getGeoCameras, getGeoZones, generateLiveGeoEvents, createMockSuspectToken, simulateNextPursuitStep } from '../services/mockGeoService';
import { generateSuspectProfile } from '../services/mockAiService';
import { sendAlert } from '../services/notificationService'; 
import ProfilingCard from '../components/ProfilingCard';

// Mock Map Component
const MockMapVisualization = ({ cameras, zones, events, suspect }: { cameras: GeoCamera[], zones: GeoZone[], events: GeoEvent[], suspect: SuspectToken | null }) => {
  // Scale factor adjusted to fit mock coordinates (spread approx 0.01 deg) into % view
  const SCALE_FACTOR = 8000; 

  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden group">
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
            backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Topology Lines (Pursuit Mode) */}
      {suspect && (
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Draw lines between timeline points */}
            <polyline 
               points={suspect.timeline.map(t => {
                  const cam = cameras.find(c => c.id === t.cameraId);
                  if (!cam) return '0,0';
                  // Simple Mock Projection
                  const x = ((cam.geo.lng - 100.5018) * SCALE_FACTOR) + 50;
                  const y = ((cam.geo.lat - 13.7563) * -SCALE_FACTOR) + 50;
                  return `${x}%,${y}%`;
               }).reverse().join(' ')}
               fill="none"
               stroke="#ef4444"
               strokeWidth="2"
               strokeDasharray="5,5"
               className="animate-pulse"
            />
         </svg>
      )}

      {/* Cameras Layer */}
      {cameras.map(cam => {
        const isNextProbable = suspect?.predictedNextCameras.includes(cam.id);
        const isCurrent = suspect?.lastCameraId === cam.id;

        return (
        <div 
            key={cam.id}
            className={`absolute flex flex-col items-center cursor-pointer group/cam hover:z-50 transition-all duration-500 ${isCurrent ? 'scale-125 z-40' : ''}`}
            style={{ 
                left: `${((cam.geo.lng - 100.5018) * SCALE_FACTOR) + 50}%`, 
                top: `${((cam.geo.lat - 13.7563) * -SCALE_FACTOR) + 50}%` 
            }}
        >
            <div className="relative">
                {isNextProbable && <div className="absolute -inset-4 border-2 border-dashed border-yellow-500 rounded-full animate-spin-slow"></div>}
                {isCurrent && <div className="absolute -inset-6 bg-red-500/20 rounded-full animate-ping"></div>}
                
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] absolute -top-8 -left-[20px] transform rotate-45 transition-colors duration-300" style={{ borderTopColor: isCurrent ? '#ef4444' : isNextProbable ? '#eab308' : 'rgba(34, 197, 94, 0.2)' }}></div>
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg relative z-10 transition-colors ${isCurrent ? 'bg-red-600' : isNextProbable ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            </div>
            <div className={`mt-1 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/cam:opacity-100 transition-opacity whitespace-nowrap ${isCurrent ? 'bg-red-600 text-white opacity-100' : 'bg-black/80 text-white'}`}>
                {cam.name}
            </div>
        </div>
      )})}

      {/* Existing Events Layer (Standard) */}
      {!suspect && events.map(evt => (
        <div 
            key={evt.id}
            className="absolute flex flex-col items-center cursor-pointer animate-fade-in z-20 hover:z-50"
            style={{ 
                left: `${((evt.location.lng - 100.5018) * SCALE_FACTOR) + 50}%`, 
                top: `${((evt.location.lat - 13.7563) * -SCALE_FACTOR) + 50}%` 
            }}
        >
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transform transition-transform hover:scale-125 ${evt.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                {evt.type === 'PERSON' ? <img src="https://api.iconify.design/lucide:user.svg?color=white" className="w-4 h-4"/> : <img src="https://api.iconify.design/lucide:car.svg?color=white" className="w-4 h-4"/>}
            </div>
        </div>
      ))}
    </div>
  );
};

const MapOperations: React.FC = () => {
  const [cameras, setCameras] = useState<GeoCamera[]>([]);
  const [zones, setZones] = useState<GeoZone[]>([]);
  const [events, setEvents] = useState<GeoEvent[]>([]);
  
  // Pursuit Mode State
  const [activeSuspect, setActiveSuspect] = useState<SuspectToken | null>(null);
  
  // Mock Profile State
  const [liveProfile, setLiveProfile] = useState<SuspectProfile | null>(null);

  useEffect(() => {
    setCameras(getGeoCameras());
    setZones(getGeoZones());
    
    // Background Events
    const interval = setInterval(() => {
        setEvents(prev => {
            const newEvents = generateLiveGeoEvents(1);
            return [...newEvents, ...prev].slice(0, 10);
        });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulation for Pursuit with Alerts
  useEffect(() => {
    let pursuitInterval: any;
    if (activeSuspect) {
        // Generate Profile on start
        if (!liveProfile) {
            const p = generateSuspectProfile('PERSON');
            setLiveProfile(p);
            
            // ALERT: New Suspicious
            sendAlert('SUSPICIOUS_DETECTED', {
                object_type: 'บุคคล (Person)',
                risk_score: p.riskScore.toString(),
                location: 'Main Hall',
                time: new Date().toLocaleTimeString(),
                attributes: 'เสื้อแดง กางเกงดำ'
            }, activeSuspect.tokenId);
        }

        pursuitInterval = setInterval(() => {
            const nextState = simulateNextPursuitStep(activeSuspect);
            if (nextState) {
                // ALERT: Handoff Success
                if (nextState.lastCameraId !== activeSuspect.lastCameraId) {
                    const cam = cameras.find(c => c.id === nextState.lastCameraId);
                    sendAlert('HANDOFF_SUCCESS', {
                        location: cam?.name || 'Unknown',
                        duration: '2',
                        next_location: 'Corridor B'
                    }, activeSuspect.tokenId);
                }
                
                setActiveSuspect(nextState);
            } else {
                // End of path -> ALERT: Lost
                sendAlert('TARGET_LOST', {
                    timeout: '1',
                    last_time: new Date().toLocaleTimeString(),
                    location: 'Exit Gate'
                }, activeSuspect.tokenId);
                
                clearInterval(pursuitInterval);
            }
        }, 4000); // Slower hop for demo
    } else {
        setLiveProfile(null);
    }
    return () => clearInterval(pursuitInterval);
  }, [activeSuspect]);

  const startPursuit = () => {
      setActiveSuspect(createMockSuspectToken());
  };

  const stopPursuit = () => {
      setActiveSuspect(null);
  };

  const handleProfileActions = (action: string) => {
      if (action === 'TRACK') {
          startPursuit();
      } else if (action === 'REPORT') {
          alert('ส่งรายงานไปยังศูนย์บัญชาการเรียบร้อยแล้ว');
      }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in relative">
      {/* Header Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
         <div className="pointer-events-auto bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl flex flex-col gap-2">
            <h1 className="text-lg font-bold text-white px-2 flex items-center gap-2">
                <MapIcon className="text-primary-400" size={20} /> ศูนย์ปฏิบัติการจีโอการ์ด (GeoGuard Ops Center)
            </h1>
            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={stopPursuit}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-2 ${!activeSuspect ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Radio size={12} /> เฝ้าระวัง (Monitoring)
                </button>
                <button 
                    onClick={startPursuit}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-2 ${activeSuspect ? 'bg-red-600 text-white shadow animate-pulse' : 'text-slate-400 hover:text-white'}`}
                >
                    <Footprints size={12}/> ติดตามเป้าหมาย (Active Pursuit)
                </button>
            </div>
         </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 bg-black rounded-xl overflow-hidden border border-slate-800 relative">
         <MockMapVisualization cameras={cameras} zones={zones} events={events} suspect={activeSuspect} />
         
         {/* Live Profiling Popup (NEW Feature) */}
         {activeSuspect && liveProfile && (
             <div className="absolute top-1/2 left-1/2 -translate-x-[150%] -translate-y-[50%] z-30">
                 <ProfilingCard profile={liveProfile} onAction={handleProfileActions} />
                 {/* Connecting Line */}
                 <svg className="absolute top-1/2 -right-12 w-12 h-2 overflow-visible pointer-events-none">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                    <circle cx="100%" cy="1" r="3" fill="#ef4444" />
                 </svg>
             </div>
         )}

         {/* Pursuit Status Overlay */}
         {activeSuspect && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900/90 backdrop-blur border border-red-500/50 px-6 py-3 rounded-full flex items-center gap-4 text-white shadow-2xl z-20">
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] text-red-200 uppercase tracking-widest font-bold">สถานะ</span>
                     <span className="font-bold flex items-center gap-1"><UserCheck size={14}/> {activeSuspect.status}</span>
                 </div>
                 <div className="h-8 w-px bg-red-500/50"></div>
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] text-red-200 uppercase tracking-widest font-bold">พบล่าสุด</span>
                     <span className="font-mono">{activeSuspect.lastSeenTime?.toLocaleTimeString() || '--:--'}</span>
                 </div>
                 <div className="h-8 w-px bg-red-500/50"></div>
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] text-red-200 uppercase tracking-widest font-bold">การคาดการณ์</span>
                     <span className="font-bold text-yellow-400">{activeSuspect.predictedNextCameras.length > 0 ? 'High Prob.' : 'Searching...'}</span>
                 </div>
             </div>
         )}
      </div>

      {/* Right Panel: Context Aware */}
      <div className="absolute top-4 bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-transform">
         {activeSuspect ? (
             <>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-red-950/30">
                    <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                            <Crosshair size={16} className="text-red-400"/> Pursuit Timeline
                        </h3>
                        <p className="text-[10px] text-red-300">Tracking ID: {activeSuspect.tokenId}</p>
                    </div>
                    <button onClick={stopPursuit} className="text-slate-400 hover:text-white"><X size={16}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-0">
                    {/* Timeline Items */}
                    {activeSuspect.timeline.map((step, i) => (
                        <div key={step.id} className="relative pl-6 pb-6 border-l border-slate-700 last:border-0 last:pb-0">
                            <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${i === 0 ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}></div>
                            {i === 0 && <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-red-500"></div>}
                            
                            <div className="bg-slate-800/50 border border-slate-700 p-2 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-white">{step.cameraName}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{step.timestamp?.toLocaleTimeString() || ''}</span>
                                </div>
                                <div className="flex gap-2">
                                    <img src={step.snapshotUrl} className="w-10 h-10 rounded object-cover bg-black" />
                                    <div>
                                        <div className={`text-[10px] font-bold ${step.confidence > 0.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            Match: {(step.confidence * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{step.action}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Prediction Placeholder */}
                    {activeSuspect.predictedNextCameras.length > 0 && (
                        <div className="relative pl-6 pt-6 border-l border-slate-700 border-dashed">
                             <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full border-2 border-slate-900 bg-yellow-500"></div>
                             <div className="text-xs text-yellow-500 font-bold flex items-center gap-1 mb-2">
                                <Clock size={12}/> จุดที่คาดว่าจะพบถัดไป
                             </div>
                             <div className="space-y-1">
                                {activeSuspect.predictedNextCameras.map(camId => (
                                    <div key={camId} className="px-2 py-1 bg-yellow-900/20 border border-yellow-700/50 rounded text-[10px] text-yellow-200">
                                        Possible: {cameras.find(c => c.id === camId)?.name || camId}
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
             </>
         ) : (
             <>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <ShieldAlert size={16} className="text-blue-400"/> Live Alerts
                    </h3>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">{events.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {events.map(evt => (
                        <div key={evt.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg hover:bg-slate-800 transition-colors group cursor-pointer">
                            {/* Standard Event Card Content */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${evt.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                    <span className="text-xs font-bold text-white">{evt.type}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp?.toLocaleTimeString() || ''}</span>
                            </div>
                            <div className="text-[10px] text-slate-300 truncate">{evt.description}</div>
                            <button onClick={startPursuit} className="mt-2 w-full py-1 bg-slate-700 hover:bg-red-600 text-[10px] font-bold text-white rounded flex items-center justify-center gap-1 transition-colors">
                                <Crosshair size={10} /> เริ่มการติดตาม (Pursuit)
                            </button>
                        </div>
                    ))}
                </div>
             </>
         )}
      </div>
    </div>
  );
};

export default MapOperations;
