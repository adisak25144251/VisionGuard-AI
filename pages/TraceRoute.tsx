
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Navigation, Clock, ChevronRight, 
  User, CheckCircle, AlertTriangle, XCircle, ArrowRight,
  Calendar, Camera, RotateCcw, Share2, Eye, Map, Layers
} from 'lucide-react';
import { getReIdTargets, getTrajectory, CAMERA_NODES, searchTargets } from '../services/mockReIdService';
import { ReIdTarget, TrajectoryPoint } from '../types';

const TraceRoute: React.FC = () => {
  const [targets, setTargets] = useState<ReIdTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ReIdTarget | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [filterType, setFilterType] = useState<'PERSON' | 'VEHICLE'>('PERSON');
  const [searchColor, setSearchColor] = useState('');

  // Animation state for the map
  const [playbackIndex, setPlaybackIndex] = useState(-1);

  useEffect(() => {
    // Initial Load
    setTargets(getReIdTargets());
  }, []);

  useEffect(() => {
    // Filter logic
    const results = searchTargets({ type: filterType, color: searchColor });
    setTargets(results);
  }, [filterType, searchColor]);

  const handleSelectTarget = (target: ReIdTarget) => {
    setSelectedTarget(target);
    const traj = getTrajectory(target.globalId);
    setTrajectory(traj.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    setPlaybackIndex(traj.length - 1); // Jump to end
  };

  const toggleConfirmPoint = (pointId: string) => {
    setTrajectory(prev => prev.map(p => 
      p.id === pointId ? { ...p, isConfirmed: !p.isConfirmed } : p
    ));
  };

  const getCameraPosition = (camId: string) => {
    const node = CAMERA_NODES.find(n => n.id === camId);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Navigation className="text-primary-400" /> Trace Route & Re-ID
          </h1>
          <p className="text-slate-400 mt-1">Cross-camera tracking and trajectory reconstruction.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setFilterType('PERSON')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'PERSON' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Person Re-ID
          </button>
          <button 
            onClick={() => setFilterType('VEHICLE')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'VEHICLE' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Vehicle Re-ID
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* LEFT PANEL: SEARCH & GALLERY */}
        <div className="w-80 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-700">
             <div className="relative mb-3">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search color, clothes..." 
                 value={searchColor}
                 onChange={(e) => setSearchColor(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
               />
             </div>
             <div className="flex gap-2 text-xs">
                <button className="flex-1 py-1.5 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">Upload Image</button>
                <button className="flex-1 py-1.5 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">Filter Time</button>
             </div>
          </div>

          <div className="flex-1 glass-panel rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar p-3 space-y-3">
             {targets.map(target => (
               <div 
                 key={target.globalId}
                 onClick={() => handleSelectTarget(target)}
                 className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 flex gap-3 ${selectedTarget?.globalId === target.globalId ? 'bg-primary-900/20 border-primary-500' : 'bg-slate-900/50 border-slate-800'}`}
               >
                 <div className="w-16 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                    <img src={target.baseImage} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-bold text-white truncate">{target.globalId}</span>
                       <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{Math.floor(target.confidence * 100)}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                       {target.attributes.color.join(', ')} • {target.attributes.clothing || target.attributes.vehicleType}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                       <Clock size={10} /> {target.lastSeen.toLocaleTimeString()}
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* CENTER: TOPOLOGY MAP */}
        <div className="flex-1 flex flex-col glass-panel rounded-xl border border-slate-700 relative overflow-hidden bg-slate-950">
           <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Map size={14} className="text-primary-400"/>
              <span className="text-xs font-bold text-white">Zone Topology View</span>
           </div>

           {/* The Map Canvas */}
           <div className="flex-1 relative">
              {/* Grid Background */}
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', 
                backgroundSize: '30px 30px',
                opacity: 0.3
              }}></div>

              {/* Zones Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-[20%] left-[5%] width-[30%] height-[80%] border-2 border-dashed border-slate-800/50 rounded-xl"></div>
              </div>

              {/* Connections (Edges) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 {/* Static Connections */}
                 <line x1="10%" y1="50%" x2="30%" y2="50%" className="stroke-slate-800 stroke-2" />
                 <line x1="30%" y1="50%" x2="50%" y2="30%" className="stroke-slate-800 stroke-2" />
                 <line x1="50%" y1="30%" x2="70%" y2="30%" className="stroke-slate-800 stroke-2" />
                 <line x1="70%" y1="30%" x2="90%" y2="30%" className="stroke-slate-800 stroke-2" />
                 <line x1="30%" y1="50%" x2="30%" y2="80%" className="stroke-slate-800 stroke-2" />
                 <line x1="30%" y1="80%" x2="70%" y2="80%" className="stroke-slate-800 stroke-2" />
                 
                 {/* Active Trajectory Path */}
                 {trajectory.length > 1 && (
                    <polyline 
                       points={trajectory.filter(p => p.isConfirmed).map(p => {
                          const pos = getCameraPosition(p.cameraId);
                          return `${pos.x}%,${pos.y}%`;
                       }).join(' ')}
                       className="fill-none stroke-primary-500 stroke-4 opacity-50"
                       strokeDasharray="10"
                    >
                       <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                    </polyline>
                 )}
              </svg>

              {/* Camera Nodes */}
              {CAMERA_NODES.map(node => (
                 <div 
                   key={node.id}
                   className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                   style={{ left: `${node.x}%`, top: `${node.y}%` }}
                 >
                    <div className={`w-3 h-3 rounded-full mb-2 transition-all ${trajectory.some(t => t.cameraId === node.id && t.isConfirmed) ? 'bg-primary-500 scale-150 shadow-[0_0_15px_#6366f1]' : 'bg-slate-700'}`}></div>
                    <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-400 font-bold opacity-70 group-hover:opacity-100 whitespace-nowrap">
                       {node.name}
                    </div>
                 </div>
              ))}
              
              {/* Moving Avatar (Simulation) */}
              {selectedTarget && trajectory.length > 0 && playbackIndex >= 0 && (
                 <div 
                   className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-primary-400 overflow-hidden shadow-2xl transition-all duration-700 ease-in-out z-20"
                   style={{ 
                      left: `${getCameraPosition(trajectory[playbackIndex].cameraId).x}%`, 
                      top: `${getCameraPosition(trajectory[playbackIndex].cameraId).y}%` 
                   }}
                 >
                    <img src={selectedTarget.baseImage} className="w-full h-full object-cover" />
                 </div>
              )}
           </div>

           {/* Timeline Controls */}
           <div className="h-16 bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                 <button className="text-slate-400 hover:text-white"><RotateCcw size={18} /></button>
                 <div className="flex-1 relative h-2 bg-slate-800 rounded-full">
                    <div 
                       className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-500"
                       style={{ width: `${((playbackIndex + 1) / trajectory.length) * 100}%` }}
                    ></div>
                    {/* Tick Marks */}
                    {trajectory.map((p, i) => (
                       <div 
                          key={p.id} 
                          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 cursor-pointer transition-colors ${i <= playbackIndex ? 'bg-primary-500 border-slate-900' : 'bg-slate-700 border-slate-900'}`}
                          style={{ left: `${((i + 1) / trajectory.length) * 100}%`, marginLeft: '-6px' }}
                          onClick={() => setPlaybackIndex(i)}
                       ></div>
                    ))}
                 </div>
                 <span className="text-xs font-mono text-slate-400 w-24 text-right">
                    {playbackIndex >= 0 && trajectory[playbackIndex] ? trajectory[playbackIndex].timestamp.toLocaleTimeString() : '--:--:--'}
                 </span>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: MATCH DETAILS */}
        <div className="w-80 flex flex-col gap-4">
           {selectedTarget ? (
              <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                 <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                    <h3 className="font-bold text-white flex items-center gap-2">
                       <User size={16} className="text-primary-400"/> Identity Chain
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">GID: {selectedTarget.globalId}</p>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800"></div>

                    {trajectory.map((point, index) => (
                       <div key={point.id} className={`relative pl-8 mb-6 group ${!point.isConfirmed ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
                          {/* Node Dot */}
                          <div className={`absolute left-[19px] top-0 w-3 h-3 rounded-full border-2 border-slate-900 ${point.isConfirmed ? 'bg-primary-500' : 'bg-yellow-500'}`}></div>
                          
                          <div className="bg-slate-900 rounded-lg border border-slate-800 p-2 hover:border-slate-600 transition-colors">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-200">{point.cameraName}</span>
                                <span className="text-[10px] font-mono text-slate-500">{point.timestamp.toLocaleTimeString()}</span>
                             </div>
                             
                             <div className="flex gap-2">
                                <div className="w-16 h-10 bg-black rounded overflow-hidden">
                                   <img src={point.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                   <div className="flex items-center gap-1 text-[10px]">
                                      <span className="text-slate-400">Match:</span>
                                      <span className={`font-bold ${point.confidence > 0.9 ? 'text-green-400' : point.confidence > 0.8 ? 'text-yellow-400' : 'text-red-400'}`}>
                                         {Math.floor(point.confidence * 100)}%
                                      </span>
                                   </div>
                                   
                                   {/* Action Buttons */}
                                   <div className="flex gap-1 mt-1">
                                      {point.isConfirmed ? (
                                         <button onClick={() => toggleConfirmPoint(point.id)} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-[10px] py-0.5 rounded border border-red-900/30 flex items-center justify-center gap-1">
                                            <XCircle size={10} /> Unlink
                                         </button>
                                      ) : (
                                         <button onClick={() => toggleConfirmPoint(point.id)} className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 text-[10px] py-0.5 rounded border border-green-900/30 flex items-center justify-center gap-1">
                                            <CheckCircle size={10} /> Confirm
                                         </button>
                                      )}
                                      <button className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded">
                                         <Eye size={12} />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-2">
                    <button className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded text-sm font-bold shadow flex items-center justify-center gap-2">
                       <Share2 size={16} /> Export Trajectory
                    </button>
                    <div className="flex justify-between text-[10px] text-slate-500">
                       <span>Points: {trajectory.filter(p => p.isConfirmed).length}</span>
                       <span>Duration: 45m</span>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                    <Navigation size={32} className="opacity-50" />
                 </div>
                 <h3 className="text-white font-bold mb-1">Select a Target</h3>
                 <p className="text-xs">Choose a Re-ID target from the gallery to view their movement path.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TraceRoute;
