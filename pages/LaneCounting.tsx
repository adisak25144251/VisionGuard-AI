
import React, { useState, useEffect } from 'react';
import { Activity, Car, Truck, Bike, ArrowUp, ArrowDown, Settings, Play, Pause, BarChart2, Signal, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { connectTrafficWebSocket } from '../services/realApiService';

const LaneCounting: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    cars: 0,
    trucks: 0,
    bikes: 0,
    flowRate: 0 // vehicles per min
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket Connection
  useEffect(() => {
    if (!isActive) return;

    // Connect to Real Traffic Stream
    const ws = connectTrafficWebSocket((data) => {
        setIsConnected(true);
        // Assuming data format: { type: 'COUNT', class: 'CAR', total: 120, ... }
        if (data.type === 'COUNT_UPDATE') {
            setStats({
                total: data.total,
                cars: data.cars,
                trucks: data.trucks,
                bikes: data.bikes,
                flowRate: data.flowRate
            });
            
            // Update Chart
            setChartData(prev => {
                const newData = [...prev, { time: new Date().toLocaleTimeString(), in: data.inCount, out: data.outCount }];
                return newData.slice(-20); // Keep last 20 points
            });
        }
    });

    // Cleanup
    return () => {
        if (ws) ws.close();
        setIsConnected(false);
    };
  }, [isActive]);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col font-sans">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="text-cyan-400" />
            การนับจำนวนรถ (Traffic Analytics)
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-slate-400">Real-time Stream Analysis</p>
             {isConnected ? (
                 <span className="flex items-center text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/30"><Wifi size={12} className="mr-1"/> Live Feed</span>
             ) : (
                 <span className="flex items-center text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-500/30"><Wifi size={12} className="mr-1"/> Waiting for Backend...</span>
             )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsActive(!isActive)} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${isActive ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'bg-green-600 text-white hover:bg-green-500'}`}>
            {isActive ? <><Pause size={18} /> หยุดนับ</> : <><Play size={18} /> เริ่มทำงาน</>}
          </button>
          <button className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"><Settings size={20} /></button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left: Video Feed & Overlay */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex-1 group flex items-center justify-center">
              {/* This should be the Real RTSP Stream (MJPEG/HLS) */}
              {!isConnected && (
                  <div className="text-slate-600 flex flex-col items-center">
                      <Signal size={48} className="opacity-20 mb-2"/>
                      <span>No Signal (Connect Real Camera)</span>
                  </div>
              )}
              {isConnected && (
                  <img 
                    src="http://localhost:8000/stream/traffic" 
                    className="w-full h-full object-cover opacity-90" 
                    alt="Live Traffic Feed"
                  />
              )}
           </div>

           {/* Chart */}
           <div className="h-64 glass-panel p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                 <BarChart2 size={16} /> แนวโน้มปริมาณจราจร
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} itemStyle={{fontSize: 12}} />
                    <Area type="monotone" dataKey="in" stroke="#22d3ee" fillOpacity={1} fill="url(#colorIn)" />
                    <Area type="monotone" dataKey="out" stroke="#f472b6" fillOpacity={1} fill="url(#colorOut)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right: Stats Panel */}
        <div className="flex flex-col gap-4">
           {/* Summary Cards */}
           <div className="glass-panel p-5 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-900">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">สถิติเรียลไทม์ (วันนี้)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-blue-400 mb-1"><Car size={16} /> <span className="text-xs font-bold">รถยนต์</span></div>
                    <div className="text-2xl font-bold text-white font-mono">{stats.cars.toLocaleString()}</div>
                 </div>
                 <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1"><Truck size={16} /> <span className="text-xs font-bold">รถบรรทุก</span></div>
                    <div className="text-2xl font-bold text-white font-mono">{stats.trucks.toLocaleString()}</div>
                 </div>
                 <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-green-400 mb-1"><Bike size={16} /> <span className="text-xs font-bold">มอเตอร์ไซค์</span></div>
                    <div className="text-2xl font-bold text-white font-mono">{stats.bikes.toLocaleString()}</div>
                 </div>
                 <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-purple-400 mb-1"><Activity size={16} /> <span className="text-xs font-bold">อัตราไหล/นาที</span></div>
                    <div className="text-2xl font-bold text-white font-mono">{stats.flowRate}</div>
                 </div>
              </div>
           </div>

           {/* Event Log */}
           <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <h3 className="text-sm font-bold text-white">ประวัติการผ่านล่าสุด</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                 {!isConnected && (
                     <div className="text-center p-4 text-slate-500 text-xs">Waiting for stream...</div>
                 )}
                 {isConnected && chartData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors text-xs">
                       <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">{d.time}</span>
                          <span className="font-bold text-blue-400">Vehicle Detected</span>
                       </div>
                       <span className="text-slate-400">Lane 1</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LaneCounting;
