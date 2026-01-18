
import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, ArrowRight, CheckCircle, 
  AlertTriangle, Clock, MapPin, Activity, TrendingUp, XCircle,
  FileCheck, Shield, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { generateDailyReport } from '../services/mockAiService';
import { DailySummaryReport, PriorityAction } from '../types';

const DailySummary: React.FC = () => {
  const [report, setReport] = useState<DailySummaryReport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setReport(generateDailyReport());
        setLoading(false);
    }, 800);
  }, [date]);

  const handleExport = () => {
    alert("กำลังสร้างรายงาน PDF (Simulated)...");
  };

  const getPriorityColor = (p: string) => p === 'HIGH' ? 'text-red-400 bg-red-900/20 border-red-900/30' : 'text-yellow-400 bg-yellow-900/20 border-yellow-900/30';

  if (!report || loading) {
      return (
          <div className="h-[calc(100vh-100px)] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">กำลังประมวลผลข้อมูลรายวัน...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in gap-6">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-900/20">
                <FileText size={20} className="text-white" />
             </div>
             <h1 className="text-2xl font-bold text-white">Daily Intelligence Report</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">รายงานสรุปสถานการณ์ความปลอดภัยและประสิทธิภาพระบบ</p>
        </div>
        
        <div className="flex gap-3">
           <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
              />
           </div>
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-700 transition-colors"
           >
              <Download size={16} /> Export PDF
           </button>
        </div>
      </div>

      {/* 2. Executive Summary Block */}
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
         <div className="flex-1">
            <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Shield size={16}/> Executive Summary
            </h3>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
                {report.executiveSummary}
            </p>
         </div>
         <div className="flex gap-8 border-l border-slate-800 pl-8">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">{report.stats.totalEvents}</div>
                <div className="text-xs text-slate-500 uppercase">Total Events</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{report.stats.criticalEvents}</div>
                <div className="text-xs text-slate-500 uppercase">Critical</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{report.stats.resolvedEvents}</div>
                <div className="text-xs text-slate-500 uppercase">Resolved</div>
            </div>
         </div>
      </div>

      {/* 3. KPI & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* KPI Cards */}
         <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-700 flex justify-between items-center">
               <div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">False Alarm Rate</div>
                  <div className="text-2xl font-bold text-white">{report.kpi.falseAlarmRate}%</div>
                  <div className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Within Target (&lt;5%)</div>
               </div>
               <div className="p-3 bg-blue-500/10 rounded-lg"><Activity size={20} className="text-blue-400"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-700 flex justify-between items-center">
               <div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Mean Time To Respond</div>
                  <div className="text-2xl font-bold text-white">{report.kpi.avgResponseTime} <span className="text-sm font-normal text-slate-400">min</span></div>
                  <div className="text-[10px] text-yellow-400 flex items-center gap-1"><TrendingUp size={10}/> Slight Increase</div>
               </div>
               <div className="p-3 bg-orange-500/10 rounded-lg"><Clock size={20} className="text-orange-400"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-700 flex justify-between items-center">
               <div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">System Uptime</div>
                  <div className="text-2xl font-bold text-white">{report.kpi.uptime}%</div>
               </div>
               <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle size={20} className="text-green-400"/></div>
            </div>
         </div>

         {/* Graph Area */}
         <div className="md:col-span-2 glass-panel p-5 rounded-xl border border-slate-700 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-primary-400"/> 24-Hour Activity Distribution
                </h3>
                <div className="flex gap-4 text-xs text-slate-400">
                    <div>🔥 Peak: <span className="text-white font-mono font-bold">{report.stats.peakHour}</span></div>
                    <div>📍 Hotspot: <span className="text-white font-mono font-bold">{report.stats.topRiskyZone}</span></div>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.chartData}>
                     <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={2} />
                     <YAxis stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', color: '#fff'}}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {report.chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.time === report.stats.peakHour ? '#ef4444' : '#3b82f6'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* 4. Bottom Split: Priority Actions & Timeline */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
         
         {/* Priority Actions */}
         <div className="w-1/3 flex flex-col glass-panel rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-800 bg-slate-900/30">
               <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400"/> Top Priority Actions
               </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
               {report.topActions.map(action => (
                  <div key={action.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex gap-3 group hover:border-slate-600 transition-colors">
                     <div className="mt-0.5">
                        {action.isDone ? (
                           <CheckCircle size={16} className="text-green-500" />
                        ) : (
                           <div className="w-4 h-4 border-2 border-slate-600 rounded-full"></div>
                        )}
                     </div>
                     <div className="flex-1">
                        <div className="text-sm text-slate-200 font-medium mb-1">{action.task}</div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getPriorityColor(action.priority)}`}>{action.priority}</span>
                           <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10}/> {action.location}</span>
                           {action.assignee && <span className="text-[10px] text-slate-500">👤 {action.assignee}</span>}
                        </div>
                     </div>
                  </div>
               ))}
               <button className="w-full py-2 border border-dashed border-slate-700 rounded text-xs text-slate-500 hover:text-white hover:border-slate-500 transition-colors">
                  + Add Action Item
               </button>
            </div>
         </div>

         {/* Incident Timeline */}
         <div className="flex-1 flex flex-col glass-panel rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
               <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Clock size={16} className="text-primary-400"/> Incident Timeline
               </h3>
               <span className="text-xs text-slate-500">Latest 24 Hours</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
               <div className="absolute left-9 top-6 bottom-6 w-px bg-slate-800"></div>
               <div className="space-y-6">
                  {report.timeline.map((evt, i) => (
                     <div key={evt.id} className="relative flex gap-4 group">
                        <div className={`w-2 h-2 rounded-full border-2 border-slate-950 absolute left-[1.15rem] top-1.5 z-10 ${evt.type === 'CRITICAL' ? 'bg-red-500' : evt.type === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                        <div className="w-12 text-xs font-mono text-slate-500 pt-0.5">{evt.time}</div>
                        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-colors">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h4 className={`text-sm font-bold ${evt.type === 'CRITICAL' ? 'text-red-400' : 'text-slate-200'}`}>{evt.title}</h4>
                                 <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10}/> {evt.camera}
                                 </p>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${evt.status === 'RESOLVED' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                 {evt.status}
                              </div>
                           </div>
                           {evt.image && (
                              <div className="mt-3 relative h-24 bg-black rounded overflow-hidden border border-slate-800 group-hover:border-slate-600">
                                 <img src={evt.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default DailySummary;
