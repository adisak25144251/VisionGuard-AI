
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from './Icons';
import { ChevronRight, ShieldCheck, Navigation, ActivitySquare, EyeOff, FileBarChart, BrainCircuit, Stethoscope, Map } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();

  const getIcon = (path: string) => {
    switch (path) {
      case '/': return <Icons.LayoutDashboard size={18} />;
      case '/live': return <Icons.Camera size={18} />;
      case '/map-ops': return <Map size={18} />;
      case '/features': return <Icons.Zap size={18} />;
      case '/intrusion': return <Icons.ShieldAlert size={18} />;
      case '/lane-counting': return <Icons.Activity size={18} />;
      case '/lpr': return <Icons.Car size={18} />;
      case '/face-rec': return <Icons.User size={18} />;
      case '/trace-route': return <Navigation size={18} />;
      case '/behavior': return <BrainCircuit size={18} />; 
      case '/anomaly': return <ActivitySquare size={18} />;
      case '/model-health': return <Stethoscope size={18} />;
      case '/tamper': return <EyeOff size={18} />; 
      case '/daily-summary': return <FileBarChart size={18} />;
      case '/safety': return <Icons.Flame size={18} />;
      case '/parking': return <Icons.BarChart3 size={18} />;
      case '/upload': return <Icons.FileText size={18} />;
      case '/events': return <Icons.Bell size={18} />;
      case '/evidence': return <Icons.Film size={18} />;
      case '/docs': return <Icons.BookOpen size={18} />;
      case '/settings': return <Icons.Settings size={18} />;
      case '/security-health': return <ShieldCheck size={18} />;
      default: return <Icons.LayoutDashboard size={18} />;
    }
  };

  const NAV_ITEMS_EXTENDED = [
    // Overview
    { label: 'แดชบอร์ด', path: '/', category: 'ภาพรวม' },
    { label: 'กล้องวงจรปิดสด', path: '/live', category: 'ภาพรวม' },
    { label: 'แผนที่ยุทธวิธี (GeoGuard)', path: '/map-ops', category: 'ภาพรวม' },
    { label: 'สรุปรายงานรายวัน', path: '/daily-summary', category: 'ภาพรวม' },
    { label: 'สุขภาพโมเดล AI (Drift)', path: '/model-health', category: 'ภาพรวม' },
    { label: 'ความปลอดภัยไซเบอร์', path: '/security-health', category: 'ภาพรวม' },
    { label: 'สถานะกล้อง & การก่อกวน', path: '/tamper', category: 'ภาพรวม' },
    
    // Intelligence Modules
    { label: 'ฟีเจอร์อัจฉริยะ', path: '/features', category: 'ระบบอัจฉริยะ' },
    { label: 'วิเคราะห์พฤติกรรม (Behavior)', path: '/behavior', category: 'ระบบอัจฉริยะ' }, 
    { label: 'ตรวจจับสิ่งผิดปกติ (Anomaly)', path: '/anomaly', category: 'ระบบอัจฉริยะ' },
    { label: 'ตรวจจับการบุกรุก', path: '/intrusion', category: 'ระบบอัจฉริยะ' },
    { label: 'นับจำนวนจราจร', path: '/lane-counting', category: 'ระบบอัจฉริยะ' },
    { label: 'อ่านป้ายทะเบียน (LPR)', path: '/lpr', category: 'ระบบอัจฉริยะ' },
    { label: 'จดจำใบหน้า', path: '/face-rec', category: 'ระบบอัจฉริยะ' },
    { label: 'ติดตามเส้นทาง (Re-ID)', path: '/trace-route', category: 'ระบบอัจฉริยะ' },
    
    // Safety & Facility
    { label: 'ความปลอดภัย & อัคคีภัย', path: '/safety', category: 'อาคารสถานที่' },
    { label: 'บริหารลานจอด', path: '/parking', category: 'อาคารสถานที่' },
    
    // Forensics
    { label: 'คลังหลักฐาน', path: '/evidence', category: 'สืบค้นข้อมูล' },
    { label: 'วิเคราะห์วิดีโอ (Upload)', path: '/upload', category: 'สืบค้นข้อมูล' },
    { label: 'ประวัติเหตุการณ์', path: '/events', category: 'สืบค้นข้อมูล' },
    
    // System
    { label: 'คู่มือระบบ', path: '/docs', category: 'ระบบ' },
    { label: 'ตั้งค่า', path: '/settings', category: 'ระบบ' },
  ];

  const categories = NAV_ITEMS_EXTENDED.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS_EXTENDED>);

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />

      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-950 border-r border-slate-800/80 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl font-sans`}>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center bg-slate-950 sticky top-0 z-10">
          <div className="relative flex items-center gap-3">
             <div className="relative">
                <Icons.Zap className="text-primary-500 relative z-10" size={24} fill="currentColor" fillOpacity={0.2} />
                <div className="absolute inset-0 bg-primary-500/50 blur-lg opacity-40 animate-pulse-slow"></div>
             </div>
             <div>
                <span className="text-lg font-bold text-white tracking-tight">VisionGuard</span>
                <span className="text-[10px] block text-cyan-400 font-mono tracking-wider -mt-1">ENTERPRISE AI</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="animate-fade-in">
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                {category}
                <div className="h-px bg-slate-800 flex-1"></div>
              </h3>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && toggle()}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-transparent ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center">
                          <span className={`mr-3 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            {getIcon(item.path)}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="text-slate-600" />}
                        {isActive && (
                           <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2">
            <span>v3.2.0 (Stable)</span>
            <span className="flex items-center text-green-500"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div> เชื่อมต่อแล้ว</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
             <div className="bg-gradient-to-r from-primary-600 to-cyan-500 h-full w-2/3"></div>
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-slate-600">
             <span>หน่วยความจำ</span>
             <span>2.4GB / 8GB</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
