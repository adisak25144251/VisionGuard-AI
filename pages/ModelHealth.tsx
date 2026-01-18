
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Activity, TrendingDown, TrendingUp, 
  RefreshCw, Database, BrainCircuit, CheckCircle, 
  AlertOctagon, Zap, ArrowRight, Thermometer, Layers
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

const ModelHealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DRIFT' | 'DATA' | 'PERFORMANCE'>('DRIFT');
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>('cam-001');
  const [isRetraining, setIsRetraining] = useState(false);

  // Mock Data Generators
  const generateDriftData = () => Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    baseline: 0.1,
    current: 0.1 + (Math.random() * 0.05) + (i > 7 ? i * 0.02 : 0),
    threshold: 0.3
  }));

  const generateConfData = () => Array.from({ length: 20 }, (_, i) => ({
    range: `${i * 5}-${(i + 1) * 5}%`,
    count: i < 10 ? Math.random() * 50 : Math.random() * 300
  }));

  const generateScatterData = () => {
    const data01 = Array.from({ length: 50 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, z: 10 }));
    const data02 = Array.from({ length: 30 }, () => ({ x: Math.random() * 100 + 20, y: Math.random() * 100 + 20, z: 10 }));
    return { data01, data02 };
  };

  const [driftData, setDriftData] = useState(generateDriftData());
  const [confData] = useState(generateConfData());
  const [scatterData] = useState(generateScatterData());

  useEffect(() => {
    setCameras([
      { id: 'cam-001', name: 'Main Gate', health: 95, status: 'HEALTHY' },
      { id: 'cam-002', name: 'Lobby', health: 88, status: 'HEALTHY' },
      { id: 'cam-003', name: 'Parking B1', health: 65, status: 'DRIFTING' },
      { id: 'cam-004', name: 'Warehouse', health: 42, status: 'CRITICAL' },
    ]);
  }, []);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setDriftData(generateDriftData().map(d => ({...d, current: 0.1 + Math.random()*0.02})));
      alert('Model Retrained Successfully: Version v3.2.1-patch deployed.');
    }, 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'HEALTHY': return <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">HEALTHY</span>;
      case 'DRIFTING': return <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30">DRIFT DETECTED</span>;
      case 'CRITICAL': return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 animate-pulse">CRITICAL DECAY</span>;
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Stethoscope className="text-primary-400" /> AI Health & Drift Monitor
          </h1>
          <p className="text-slate-400 mt-1">Real-time analysis of model performance, data distribution, and concept drift.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-4">
              <div>
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Global Health Score</div>
                 <div className="text-2xl font-bold text-green-400 font-mono">92/100</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div>
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Model Version</div>
                 <div className="text-sm font-bold text-white">v3.2.0-stable</div>
              </div>
           </div>
           <button 
             onClick={handleRetrain}
             disabled={isRetraining}
             className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isRetraining ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
             {isRetraining ? 'Tuning...' : 'Auto-Tune'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* LEFT: Camera Selection List */}
        <div className="w-72 flex flex-col gap-4">
           <div className="glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden h-full">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <h3 className="text-sm font-bold text-white">Monitored Endpoints</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {cameras.map(cam => (
                    <div 
                      key={cam.id}
                      onClick={() => setSelectedCamId(cam.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCamId === cam.id ? 'bg-primary-900/20 border-primary-500 ring-1 ring-primary-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-bold text-slate-200">{cam.name}</span>
                          <StatusBadge status={cam.status} />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">{cam.id}</span>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
                             <Activity size={12} className={cam.health < 70 ? 'text-red-400' : 'text-green-400'} />
                             {cam.health}%
                          </div>
                       </div>
                       {/* Mini Sparkline */}
                       <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cam.health > 80 ? 'bg-green-500' : cam.health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{width: `${cam.health}%`}}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* CENTER: Main Analytics */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto custom-scrollbar pr-2">
           
           {/* 1. Drift Metrics Cards */}
           <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-slate-700 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Database size={48}/></div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Embedding Drift (PSI)</div>
                 <div className="text-3xl font-bold text-white font-mono flex items-end gap-2">
                    0.18 <span className="text-xs text-yellow-400 font-sans mb-1 font-bold flex items-center"><TrendingUp size={12}/> +0.05</span>
                 </div>
                 <div className="text-[10px] text-slate-500 mt-2">Threshold: 0.25 (Stable)</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-700 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><BrainCircuit size={48}/></div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Confidence Entropy</div>
                 <div className="text-3xl font-bold text-white font-mono flex items-end gap-2">
                    0.65 <span className="text-xs text-green-400 font-sans mb-1 font-bold flex items-center"><CheckCircle size={12}/> Good</span>
                 </div>
                 <div className="text-[10px] text-slate-500 mt-2">Model is decisive</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-700 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><AlertOctagon size={48}/></div>
                 <div className="text-xs text-slate-400 uppercase font-bold mb-1">Human Rejection Rate</div>
                 <div className="text-3xl font-bold text-white font-mono flex items-end gap-2">
                    2.4% <span className="text-xs text-green-400 font-sans mb-1 font-bold flex items-center"><TrendingDown size={12}/> -0.5%</span>
                 </div>
                 <div className="text-[10px] text-slate-500 mt-2">Target: &lt; 5%</div>
              </div>
           </div>

           {/* 2. Drift Charts */}
           <div className="glass-panel p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                 <button onClick={() => setActiveTab('DRIFT')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'DRIFT' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Drift Trend</button>
                 <button onClick={() => setActiveTab('DATA')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'DATA' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Data Distribution</button>
                 <button onClick={() => setActiveTab('PERFORMANCE')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PERFORMANCE' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Embedding Space</button>
              </div>

              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'DRIFT' ? (
                       <LineChart data={driftData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} />
                          <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Current Shift" />
                          <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Alert Threshold" />
                          <Line type="monotone" dataKey="baseline" stroke="#10b981" strokeWidth={2} dot={false} name="Baseline" />
                       </LineChart>
                    ) : activeTab === 'DATA' ? (
                       <BarChart data={confData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="range" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                             {confData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index < 5 ? '#ef4444' : index < 12 ? '#eab308' : '#10b981'} />
                             ))}
                          </Bar>
                       </BarChart>
                    ) : (
                       <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" dataKey="x" name="PC1" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis type="number" dataKey="y" name="PC2" stroke="#64748b" tick={{fontSize: 10}} />
                          <ZAxis type="number" range={[50]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} />
                          <Scatter name="Baseline" data={scatterData.data01} fill="#10b981" shape="circle" />
                          <Scatter name="Production" data={scatterData.data02} fill="#ef4444" shape="triangle" />
                       </ScatterChart>
                    )}
                 </ResponsiveContainer>
              </div>
           </div>

           {/* 3. Action Recommendations */}
           <div className="glass-panel p-5 rounded-xl border border-slate-700 bg-slate-900/50">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Zap size={16} className="text-yellow-400" /> Recommended Actions
              </h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded"><Thermometer size={18}/></div>
                       <div>
                          <div className="text-sm font-bold text-white">Minor Drift Detected</div>
                          <div className="text-[10px] text-slate-500">Distribution shift &gt; 5% but &lt; 20%</div>
                       </div>
                    </div>
                    <button className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded border border-slate-700 hover:bg-slate-700 hover:text-white">
                       Auto-Tune Thresholds
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-500/10 text-blue-500 rounded"><Layers size={18}/></div>
                       <div>
                          <div className="text-sm font-bold text-white">New Concept Cluster</div>
                          <div className="text-[10px] text-slate-500">Found 150 samples in void space</div>
                       </div>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 flex items-center gap-1">
                       Label & Retrain <ArrowRight size={12}/>
                    </button>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ModelHealth;
