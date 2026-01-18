
import React, { useState, useEffect } from 'react';
import { 
  ActivitySquare, Filter, Play, CheckCircle, XCircle, 
  AlertTriangle, Clock, TrendingUp, Sliders, Info, Eye
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { generateAnomalyEvents, generateAnomalyStats } from '../services/mockAiService';
import { AnomalyEvent, AnomalyStats } from '../types';

const AnomalyDetection: React.FC = () => {
  const [events, setEvents] = useState<AnomalyEvent[]>([]);
  const [stats, setStats] = useState<AnomalyStats[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AnomalyEvent | null>(null);
  const [scoreThreshold, setScoreThreshold] = useState(60);
  const [cooldown, setCooldown] = useState(5); // Minutes

  useEffect(() => {
    setEvents(generateAnomalyEvents(25));
    setStats(generateAnomalyStats());
  }, []);

  const getSeverityColor = (score: number) => {
    if (score > 90) return '#ef4444'; // Red
    if (score > 70) return '#f97316'; // Orange
    if (score > 50) return '#eab308'; // Yellow
    return '#3b82f6'; // Blue
  };

  const getSeverityLabel = (score: number) => {
    if (score > 90) return 'CRITICAL';
    if (score > 70) return 'HIGH';
    if (score > 50) return 'MEDIUM';
    return 'LOW';
  };

  const handleAction = (id: string, action: 'CONFIRM' | 'IGNORE') => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: action === 'CONFIRM' ? 'REVIEWED' : 'FALSE_POSITIVE' } : e));
    if (selectedEvent?.id === id) {
      setSelectedEvent(prev => prev ? { ...prev, status: action === 'CONFIRM' ? 'REVIEWED' : 'FALSE_POSITIVE' } : null);
    }
  };

  const filteredEvents = events.filter(e => e.score >= scoreThreshold);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ActivitySquare className="text-primary-400" /> Anomaly Detection
          </h1>
          <p className="text-slate-400 mt-1">Unsupervised learning to detect unknown threats and behavioral deviations.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Sensitivity Threshold</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={scoreThreshold} 
                onChange={(e) => setScoreThreshold(parseInt(e.target.value))}
                className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-sm font-mono text-white w-8">{scoreThreshold}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Column: Visualization & List */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
           
           {/* Chart Section */}
           <div className="h-64 glass-panel p-4 rounded-xl border border-slate-700 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <TrendingUp size={16} /> Anomaly Distribution (24 Hours)
                 </h3>
                 <div className="flex gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> High</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium</span>
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis type="category" dataKey="hour" name="Time" stroke="#64748b" tick={{fontSize: 10}} allowDuplicatedCategory={false} />
                      <YAxis type="number" dataKey="score" name="Score" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                                <p className="text-white font-bold">{data.hour}</p>
                                <p className="text-slate-400">Score: <span className="text-primary-400">{data.score}</span></p>
                                <p className="text-slate-500">Events: {data.count}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={stats} fill="#8884d8">
                        {stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getSeverityColor(entry.score)} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Event List */}
           <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-white">Detected Anomalies ({filteredEvents.length})</h3>
                 <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <Filter size={12} /> Filter
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {filteredEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${selectedEvent?.id === evt.id ? 'bg-primary-900/20 border-primary-500' : 'bg-slate-900/50 border-slate-800'}`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                             <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${evt.score > 90 ? 'bg-red-500' : evt.score > 70 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                {evt.score}
                             </div>
                             <span className="text-sm font-bold text-slate-200">{evt.type.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp.toLocaleTimeString()}</span>
                       </div>
                       <p className="text-xs text-slate-400 line-clamp-1">{evt.description}</p>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-500">{evt.cameraName}</span>
                          <div className="flex gap-2">
                             {evt.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                             {evt.status === 'FALSE_POSITIVE' && <span className="text-[10px] text-slate-600">Ignored</span>}
                             {evt.status === 'REVIEWED' && <span className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Ack</span>}
                          </div>
                       </div>
                    </div>
                 ))}
                 {filteredEvents.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                       No anomalies detected above threshold {scoreThreshold}.
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="w-96 flex flex-col gap-4">
           {selectedEvent ? (
              <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                 <div className="relative h-48 bg-black">
                    <img src={selectedEvent.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-all text-white">
                          <Play size={32} fill="white" />
                       </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white border border-slate-700">
                       {selectedEvent.cameraName}
                    </div>
                 </div>

                 <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                       <div>
                          <div className="text-xs text-slate-500 font-bold uppercase mb-1">Anomaly Type</div>
                          <h2 className="text-lg font-bold text-white">{selectedEvent.type.replace(/_/g, ' ')}</h2>
                       </div>
                       <div className="text-right">
                          <div className="text-3xl font-bold font-mono text-primary-400">{selectedEvent.score}</div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedEvent.score > 90 ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                             {getSeverityLabel(selectedEvent.score)}
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 mb-6">
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <Info size={12} /> Deviation Metrics
                       </h4>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                             <span className="block text-slate-500 text-[10px]">{selectedEvent.metrics.label}</span>
                             <span className="block text-white font-bold">{selectedEvent.metrics.current}</span>
                          </div>
                          <div>
                             <span className="block text-slate-500 text-[10px]">Baseline (Avg)</span>
                             <span className="block text-slate-300">{selectedEvent.metrics.baseline}</span>
                          </div>
                       </div>
                       <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-xs text-slate-400">Deviation</span>
                          <span className="text-red-400 font-bold font-mono">{selectedEvent.metrics.deviation}</span>
                       </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                       {selectedEvent.description}. The system detected this pattern deviates significantly from the 14-day moving average for this time period.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => handleAction(selectedEvent.id, 'IGNORE')}
                         className="py-2 border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                       >
                          <XCircle size={16} /> False Positive
                       </button>
                       <button 
                         onClick={() => handleAction(selectedEvent.id, 'CONFIRM')}
                         className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary-900/20"
                       >
                          <CheckCircle size={16} /> Confirm Alert
                       </button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                    <ActivitySquare size={32} className="opacity-50" />
                 </div>
                 <h3 className="text-white font-bold mb-1">Anomaly Inspector</h3>
                 <p className="text-xs">Select an event from the list to analyze deviation metrics and take action.</p>
              </div>
           )}

           {/* Rules Config Mini-Panel */}
           <div className="glass-panel p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                 <Sliders size={12} className="text-slate-400" /> Suppression Rules
              </h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Ignore Rain/Weather</span>
                    <input type="checkbox" defaultChecked className="accent-primary-500" />
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Ignore Small Animals</span>
                    <input type="checkbox" defaultChecked className="accent-primary-500" />
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-400">Alert Cooldown</span>
                       <span className="text-white">{cooldown} min</span>
                    </div>
                    <input 
                      type="range" min="1" max="60" 
                      value={cooldown} onChange={(e) => setCooldown(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-primary-500"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
