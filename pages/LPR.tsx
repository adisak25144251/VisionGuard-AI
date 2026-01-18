
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Car, AlertTriangle, Eye, X, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import { getRealPlates } from '../services/realApiService'; 
import { PlateRecord } from '../types';

const LPR: React.FC = () => {
  const [plates, setPlates] = useState<PlateRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlate, setSelectedPlate] = useState<PlateRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getRealPlates();
      setPlates(data);
    } catch (e) {
      console.error("Failed to load LPR data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll for real data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredPlates = plates.filter(p => 
    p.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            ระบบอ่านป้ายทะเบียน (ALPR)
            {isLoading && <RefreshCw size={18} className="animate-spin text-slate-500" />}
          </h1>
          <p className="text-slate-400 mt-1">ข้อมูล Real-time จากกล้องตรวจจับ (Production Mode)</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาทะเบียน (เช่น 1กข)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
            <Calendar size={16} />
            <span>ช่วงเวลา</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-900/20">
            <Download size={16} />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Overview (Calculated from Data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">รถวันนี้</p>
            <h3 className="text-2xl font-bold text-white mt-1">{plates.length}</h3>
          </div>
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Car size={24} />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">พบรถต้องสงสัย</p>
            <h3 className="text-2xl font-bold text-red-400 mt-1">{plates.filter(p => p.isWatchlist).length}</h3>
          </div>
          <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">ความแม่นยำเฉลี่ย</p>
            <h3 className="text-2xl font-bold text-green-400 mt-1">
                {plates.length > 0 ? (plates.reduce((acc, p) => acc + p.confidence, 0) / plates.length * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-300 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">ภาพรถยนต์</th>
                <th className="px-6 py-4">ทะเบียน</th>
                <th className="px-6 py-4">จังหวัด</th>
                <th className="px-6 py-4">เวลา</th>
                <th className="px-6 py-4">กล้อง</th>
                <th className="px-6 py-4">ประเภทรถ</th>
                <th className="px-6 py-4 text-center">ดูข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPlates.map((plate) => (
                <tr key={plate.id} className={`hover:bg-slate-800/40 transition-colors group ${plate.isWatchlist ? 'bg-red-900/10' : ''}`}>
                  <td className="px-6 py-3">
                    <div className="relative w-24 h-14 rounded overflow-hidden border border-slate-700 group-hover:border-primary-500/50 transition-colors">
                      <img src={plate.imageFull} alt="Vehicle" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-10 h-6 border-l border-t border-slate-900">
                         <img src={plate.imageCrop} alt="Plate" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className={`text-lg font-mono font-bold ${plate.isWatchlist ? 'text-red-400' : 'text-slate-100'}`}>
                        {plate.plateNumber}
                      </span>
                      {plate.isWatchlist && (
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded w-fit font-bold uppercase">บัญชีดำ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{plate.province}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-200">{plate.timestamp.toLocaleTimeString()}</span>
                      <span className="text-xs text-slate-500">{plate.timestamp.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{plate.cameraName}</td>
                  <td className="px-6 py-3">
                    <span className="block text-slate-200">{plate.vehicleColor}</span>
                    <span className="text-xs text-slate-500">{plate.vehicleType}</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => setSelectedPlate(plate)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-400 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPlates.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <WifiOff size={24} className="opacity-50" />
            </div>
            <p className="text-lg font-bold text-slate-400">ไม่พบข้อมูล หรือยังไม่ได้เชื่อมต่อ Backend</p>
            <p className="text-xs text-slate-600 mt-2">
                โปรดตรวจสอบว่า AI Server กำลังทำงาน และมีการตรวจจับรถเกิดขึ้นจริง
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPlate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedPlate(null)}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative bg-black h-full min-h-[400px]">
                <img src={selectedPlate.imageFull} alt="Full capture" className="w-full h-full object-contain" />
                <div className="absolute bottom-4 right-4 border-2 border-white/20 rounded-lg overflow-hidden shadow-lg w-40">
                  <img src={selectedPlate.imageCrop} alt="Plate crop" className="w-full h-auto" />
                  <div className="bg-slate-900/90 text-center text-xs py-1 text-slate-300 font-mono">
                    {(selectedPlate.confidence * 100).toFixed(1)}% CONF
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                   <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">ข้อมูลยานพาหนะ</h3>
                   <div className="flex items-center space-x-4">
                     <div className="bg-white text-black border-2 border-black rounded px-4 py-2 font-mono text-3xl font-bold shadow-sm">
                       {selectedPlate.plateNumber}
                       <div className="text-[10px] text-center font-sans font-normal -mt-1 text-slate-600 uppercase">{selectedPlate.province}</div>
                     </div>
                     {selectedPlate.isWatchlist && (
                       <div className="flex items-center text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                         <AlertTriangle size={16} className="mr-2" />
                         <span className="font-bold text-sm">รถต้องสงสัย</span>
                       </div>
                     )}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">เวลาที่พบ</label>
                    <p className="text-slate-200 font-medium">{selectedPlate.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">สถานที่ (กล้อง)</label>
                    <p className="text-slate-200 font-medium">{selectedPlate.cameraName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">ประเภทรถ</label>
                    <p className="text-slate-200 font-medium">{selectedPlate.vehicleColor} - {selectedPlate.vehicleType}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">ค่าความเชื่อมั่น (AI Score)</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${selectedPlate.confidence * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-mono text-slate-300">{(selectedPlate.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPR;
