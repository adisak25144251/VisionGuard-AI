
import React, { useState, useEffect } from 'react';
import { Car, Clock, MapPin, Search, ArrowRight, CircleDollarSign } from 'lucide-react';

interface ParkingSlot {
  id: string;
  isOccupied: boolean;
  plate?: string;
  entryTime?: Date;
  type: 'REGULAR' | 'VIP' | 'DISABLED';
}

const ParkingManagement: React.FC = () => {
  const [floor, setFloor] = useState('1A');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);

  // Init mock slots
  useEffect(() => {
    const newSlots: ParkingSlot[] = Array.from({ length: 24 }, (_, i) => ({
      id: `${floor}-${101 + i}`,
      isOccupied: Math.random() > 0.4,
      plate: Math.random() > 0.4 ? `1กข-${Math.floor(Math.random()*9000)+1000}` : undefined,
      entryTime: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 7200000) : undefined,
      type: i < 4 ? 'VIP' : i > 20 ? 'DISABLED' : 'REGULAR'
    }));
    setSlots(newSlots);

    // Simulation
    const interval = setInterval(() => {
      setSlots(current => {
         const idx = Math.floor(Math.random() * current.length);
         const updated = [...current];
         const slot = updated[idx];
         if (slot.isOccupied) {
            // Car leaves
            updated[idx] = { ...slot, isOccupied: false, plate: undefined, entryTime: undefined };
         } else {
            // Car enters
            updated[idx] = { 
               ...slot, 
               isOccupied: true, 
               plate: `2ขค-${Math.floor(Math.random()*9000)+1000}`, 
               entryTime: new Date() 
            };
         }
         return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [floor]);

  const occupiedCount = slots.filter(s => s.isOccupied).length;
  const availableCount = slots.length - occupiedCount;

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col font-sans">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
               <div className="p-2 bg-blue-600 rounded-lg"><Car size={24} /></div>
               บริหารลานจอดรถ (Smart Parking)
            </h1>
            <p className="text-slate-400 mt-1">ติดตามสถานะช่องจอดแบบเรียลไทม์ เชื่อมต่อ LPR และประมาณการรายได้</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase">ช่องจอดไม่ว่าง</div>
                <div className="text-2xl font-bold text-white">{occupiedCount} / {slots.length}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase">ว่าง</div>
                <div className="text-2xl font-bold text-green-400">{availableCount}</div>
             </div>
          </div>
       </div>

       <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Main Visual Map */}
          <div className="flex-1 flex flex-col glass-panel rounded-xl border border-slate-700">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex gap-2">
                   {['1A', '1B', '2A', '2B'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setFloor(f)}
                        className={`px-3 py-1 rounded text-sm font-bold transition-all ${floor === f ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                         ชั้น {f}
                      </button>
                   ))}
                </div>
                <div className="flex gap-4 text-xs">
                   <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> ว่าง</span>
                   <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> ไม่ว่าง</span>
                   <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded"></div> VIP</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/50">
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                   {slots.map(slot => (
                      <div 
                         key={slot.id} 
                         className={`relative h-32 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                            slot.isOccupied 
                               ? 'bg-slate-800/80 border-red-500/50' 
                               : slot.type === 'VIP' ? 'bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/40' : 'bg-green-900/10 border-green-500/50 hover:bg-green-900/20'
                         }`}
                      >
                         <div className="absolute top-2 left-2 text-xs font-bold text-slate-500">{slot.id}</div>
                         {slot.type !== 'REGULAR' && (
                            <div className="absolute top-2 right-2 text-[10px] font-bold px-1 rounded bg-slate-700 text-slate-300">{slot.type}</div>
                         )}
                         
                         {slot.isOccupied ? (
                            <>
                               <Car size={32} className="text-red-400 mb-1" />
                               <div className="text-sm font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{slot.plate}</div>
                               <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Clock size={10} /> 
                                  {Math.floor((Date.now() - (slot.entryTime?.getTime() || 0)) / 60000)}m
                               </div>
                            </>
                         ) : (
                            <div className="text-green-500/50 font-bold text-sm">ว่าง</div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Sidebar Stats */}
          <div className="w-80 flex flex-col gap-4">
             <div className="glass-panel p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white mb-3">กิจกรรมล่าสุด</h3>
                <div className="space-y-3">
                   {slots.filter(s => s.isOccupied).slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-800">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-500/20 text-green-500 rounded"><ArrowRight size={12}/></div>
                            <div>
                               <div className="text-xs font-bold text-white">{s.plate}</div>
                               <div className="text-[10px] text-slate-500">ช่อง {s.id}</div>
                            </div>
                         </div>
                         <span className="text-[10px] text-slate-400">เมื่อสักครู่</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="glass-panel p-4 rounded-xl border border-slate-700 flex-1">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2"><CircleDollarSign size={16} className="text-yellow-400"/> ประมาณการรายได้</h3>
                <div className="text-3xl font-bold text-white font-mono mb-1">฿ 12,450</div>
                <div className="text-xs text-slate-400 mb-6">ยอดรวมวันนี้ (ประมาณการ)</div>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">อัตราค่าบริการ</span>
                      <span className="text-white">฿ 20 / ชม.</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">เวลาจอดเฉลี่ย</span>
                      <span className="text-white">2.5 ชม.</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ParkingManagement;
