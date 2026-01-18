
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Users, Car, AlertTriangle, ArrowUpRight, ArrowDownRight, HardDrive, Cpu, ShieldCheck } from 'lucide-react';
// import { generateChartData } from '../services/mockAiService'; // Removed Mock

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // In Production: Fetch this from API
    // setData([]); 
    // For now, we leave it empty to indicate "Waiting for data"
  }, []);

  const StatCard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
    <div className="glass-panel p-5 rounded-xl border-t-4 hover:translate-y-[-2px] transition-transform duration-300" style={{ borderTopColor: `var(--color-${color})` }}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg bg-slate-800/50 text-${color}-400 ring-1 ring-slate-700`}>
          <Icon size={20} />
        </div>
        {trend && (
           <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${sub.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
             {sub.includes('+') ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
             {sub.replace(/^[+-]/, '')}
           </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      <p className="text-slate-400 text-sm font-medium mt-1">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            ศูนย์บัญชาการ
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-mono tracking-wide shadow-lg shadow-red-900/20">PRODUCTION</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            แดชบอร์ดติดตามสถานการณ์จริง (Real-time Production Environment)
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 font-bold uppercase">สถานะระบบ</span>
                 <span className="text-xs font-bold text-green-400 flex items-center"><ShieldCheck size={12} className="mr-1"/> Connected</span>
              </div>
           </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="ตรวจจับทั้งหมด (24ชม.)" value="0" sub="+0%" icon={Activity} color="cyan" trend={true} />
        <StatCard title="ผู้มาเยือน (ไม่ซ้ำหน้า)" value="0" sub="+0%" icon={Users} color="primary" trend={true} />
        <StatCard title="ปริมาณรถเข้า-ออก" value="0" sub="-0%" icon={Car} color="blue" trend={true} />
        <StatCard title="เหตุการณ์ความปลอดภัย" value="0" sub="+0" icon={AlertTriangle} color="red" trend={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-center items-center">
          {data.length === 0 ? (
              <div className="text-slate-500 flex flex-col items-center">
                  <Activity size={48} className="opacity-20 mb-2"/>
                  <p>รอข้อมูลจากระบบ AI (Live Feed)</p>
              </div>
          ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    {/* Chart config */}
                </AreaChart>
              </ResponsiveContainer>
          )}
        </div>

        {/* Alerts Feed */}
        <div className="glass-panel p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <AlertTriangle size={18} className="text-red-400" />
               แจ้งเตือนล่าสุด
             </h3>
             <span className="text-xs text-slate-500 font-mono">LIVE FEED</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-[350px] flex items-center justify-center">
             <span className="text-xs text-slate-600">ไม่มีรายการแจ้งเตือนใหม่</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
