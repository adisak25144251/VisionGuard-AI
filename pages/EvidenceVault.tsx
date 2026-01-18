
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Download, Play, ShieldAlert, EyeOff, Calendar, 
  FileText, Settings, X, ChevronRight, AlertTriangle, Eye, Film, 
  Briefcase, Lock, Plus, FolderOpen, History, FileCheck, Share2, 
  Printer, FileSignature, FileArchive, HardDrive, Cloud, Clock, CheckCircle, Camera,
  Link, ShieldCheck, Fingerprint, Activity, Terminal, ArrowRight, ArrowLeft, Sliders, Hash
} from 'lucide-react';
import { generateEvidencePacks, searchEvidencePacks } from '../services/mockAiService';
import { EvidencePack, StorageConfig, SearchFilters } from '../types';

const EvidenceVault: React.FC = () => {
  // Data State
  const [allPacks, setAllPacks] = useState<EvidencePack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<EvidencePack[]>([]);
  
  // Selection State
  const [selectedPack, setSelectedPack] = useState<EvidencePack | null>(null);
  const [detailTab, setDetailTab] = useState<'ASSETS' | 'LEDGER'>('ASSETS');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: '7D',
    cameras: [],
    eventTypes: [],
    severity: [],
    attributes: { color: '', direction: '', trackId: '' },
    confidenceMin: 50
  });

  // UI State
  const [showConfig, setShowConfig] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [verifyState, setVerifyState] = useState<'IDLE' | 'VERIFYING' | 'SECURE' | 'TAMPERED'>('IDLE');

  // Load Initial Data
  useEffect(() => {
    // Generate enough data to make search interesting
    const data = generateEvidencePacks(50);
    setAllPacks(data);
    setFilteredPacks(data);
  }, []);

  // Search Effect
  useEffect(() => {
    const results = searchEvidencePacks(allPacks, filters, searchTerm);
    setFilteredPacks(results);
  }, [allPacks, filters, searchTerm]);

  // Handlers
  const handleExport = (type: 'ZIP' | 'PDF' | 'CSV') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`${type} Export Generated!\nIncluded: ${selectedPack ? 'Single Pack' : `${filteredPacks.length} Filtered Results`}`);
    }, 1500);
  };

  const handleVerifyIntegrity = () => {
    setVerifyState('VERIFYING');
    setTimeout(() => {
        // Randomly simulate tamper for demo purposes (usually strictly SECURE)
        const isSecure = Math.random() > 0.1;
        setVerifyState(isSecure ? 'SECURE' : 'TAMPERED');
    }, 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Timeline Component
  const TimelineScrubber = () => {
    // Simple mock timeline buckets
    const buckets = new Array(24).fill(0);
    filteredPacks.forEach(p => {
      const hour = p.timestamp.getHours();
      buckets[hour]++;
    });
    const max = Math.max(...buckets, 1);

    return (
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-end px-4 gap-1 relative group">
         <div className="absolute top-2 left-4 text-[10px] text-slate-500 font-bold uppercase">ความหนาแน่นเหตุการณ์ (24ชม.)</div>
         {buckets.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end group/bar cursor-pointer hover:bg-slate-800/50 rounded-t relative">
               <div 
                 className={`w-full mx-auto rounded-t-sm transition-all ${count > 0 ? 'bg-primary-600 group-hover/bar:bg-primary-400' : 'bg-slate-800'}`} 
                 style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '4px' : '1px' }}
               ></div>
               <div className="text-[9px] text-slate-600 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 w-full">
                  {i}:00
               </div>
               {/* Tooltip */}
               {count > 0 && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                    {count} events
                 </div>
               )}
            </div>
         ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in font-sans">
      {/* Top Search Bar */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
         <div className="flex items-center gap-2 text-primary-400 font-bold text-lg mr-4">
            <Search size={24} />
            <span>ค้นหา<span className="text-white">หลักฐาน</span></span>
         </div>

         {/* Omni-Search Input */}
         <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='ค้นหาด้วย ID, คำสำคัญ หรือวัตถุ (เช่น "รถแดง ประตู A", "บุกรุก เมื่อวาน")'
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-2.5 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               {searchTerm && <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white"><X size={14}/></button>}
               <span className="text-slate-600 text-xs font-mono border border-slate-700 px-1.5 rounded">/</span>
            </div>
         </div>

         <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border flex items-center gap-2 text-sm font-medium transition-all ${showFilters ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
            >
               <Sliders size={16} /> ตัวกรอง
            </button>
            <button 
              onClick={() => handleExport('CSV')}
              className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors" title="Export Results"
            >
               <Download size={16} />
            </button>
            <button 
              onClick={() => setShowConfig(true)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors" title="Storage Config"
            >
               <Settings size={16} />
            </button>
         </div>
      </div>

      {/* Timeline Scrubber */}
      <TimelineScrubber />

      <div className="flex-1 flex overflow-hidden">
         {/* Filters Sidebar */}
         <div className={`w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col transition-all duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full w-0 opacity-0'} overflow-hidden`}>
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-6 flex-1">
               {/* Date Range */}
               <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={12}/> ช่วงเวลา</h4>
                  <div className="grid grid-cols-3 gap-2">
                     {['1H', '24H', '7D', '30D'].map(range => (
                        <button 
                          key={range}
                          onClick={() => setFilters({...filters, dateRange: range as any})}
                          className={`text-[10px] py-1.5 rounded border transition-colors ${filters.dateRange === range ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                        >
                           {range}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Event Type */}
               <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><ShieldAlert size={12}/> ประเภทเหตุการณ์</h4>
                  <div className="space-y-1">
                     {['INTRUSION', 'ANOMALY', 'LOITERING', 'LPR_MATCH', 'FALL'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded">
                           <input 
                             type="checkbox" 
                             className="accent-primary-500 rounded border-slate-700 bg-slate-900" 
                             checked={filters.eventTypes.includes(type)}
                             onChange={(e) => {
                                const newTypes = e.target.checked 
                                   ? [...filters.eventTypes, type]
                                   : filters.eventTypes.filter(t => t !== type);
                                setFilters({...filters, eventTypes: newTypes});
                             }}
                           />
                           <span className="text-xs text-slate-300 capitalize">{type.replace('_', ' ').toLowerCase()}</span>
                        </label>
                     ))}
                  </div>
               </div>

               {/* Attributes (Dynamic) */}
               <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Fingerprint size={12}/> ลักษณะวัตถุ</h4>
                  <div>
                     <label className="text-[10px] text-slate-500 block mb-1">สีหลัก</label>
                     <select 
                       className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                       value={filters.attributes.color}
                       onChange={(e) => setFilters({...filters, attributes: {...filters.attributes, color: e.target.value}})}
                     >
                        <option value="">ทั้งหมด</option>
                        <option value="Red">แดง (Red)</option>
                        <option value="Blue">น้ำเงิน (Blue)</option>
                        <option value="Black">ดำ (Black)</option>
                        <option value="White">ขาว (White)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] text-slate-500 block mb-1">ทิศทาง</label>
                     <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                        value={filters.attributes.direction}
                        onChange={(e) => setFilters({...filters, attributes: {...filters.attributes, direction: e.target.value}})}
                     >
                        <option value="">ทั้งหมด</option>
                        <option value="IN">เข้า (In)</option>
                        <option value="OUT">ออก (Out)</option>
                        <option value="WRONG_WAY">ย้อนศร</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] text-slate-500 block mb-1">Track ID เฉพาะ</label>
                     <input 
                        type="text" 
                        placeholder="trk-..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white p-1.5 outline-none font-mono"
                        value={filters.attributes.trackId}
                        onChange={(e) => setFilters({...filters, attributes: {...filters.attributes, trackId: e.target.value}})}
                     />
                  </div>
               </div>

               {/* Confidence */}
               <div className="space-y-2 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                     <span>ความเชื่อมั่นขั้นต่ำ</span>
                     <span>{filters.confidenceMin}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={filters.confidenceMin} 
                    onChange={(e) => setFilters({...filters, confidenceMin: parseInt(e.target.value)})}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
               </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
               <button 
                 onClick={() => setFilters({
                    dateRange: '7D', cameras: [], eventTypes: [], severity: [], 
                    attributes: { color: '', direction: '', trackId: '' }, confidenceMin: 50
                 })}
                 className="w-full py-2 border border-slate-700 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
               >
                  รีเซ็ตตัวกรอง
               </button>
            </div>
         </div>

         {/* Results Grid */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-950">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h2 className="text-xl font-bold text-white">ผลการค้นหา</h2>
                  <p className="text-xs text-slate-500">พบ {filteredPacks.length} รายการ ขนาดรวม {formatBytes(filteredPacks.reduce((a,b) => a + b.sizeBytes, 0))}</p>
               </div>
               {/* View Toggle could go here */}
            </div>

            {filteredPacks.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>ไม่พบหลักฐานที่ตรงกับเงื่อนไข</p>
                  <button 
                    onClick={() => setFilters({
                        dateRange: '30D', cameras: [], eventTypes: [], severity: [], 
                        attributes: { color: '', direction: '', trackId: '' }, confidenceMin: 0
                    })}
                    className="mt-4 text-primary-400 text-sm hover:underline"
                  >
                     ล้างตัวกรองทั้งหมด
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredPacks.map(pack => (
                     <div 
                       key={pack.id}
                       onClick={() => { setSelectedPack(pack); setDetailTab('ASSETS'); setVerifyState('IDLE'); }}
                       className={`group p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-900 ${selectedPack?.id === pack.id ? 'bg-primary-900/20 border-primary-500 ring-1 ring-primary-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pack.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                              {pack.eventType}
                           </span>
                           <span className="text-[10px] text-slate-500 font-mono">{pack.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 mb-3 group-hover:shadow-lg transition-all">
                           <img src={pack.snapshots[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                              <Play size={24} className="text-white drop-shadow-md" fill="white" />
                           </div>
                           <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-white font-mono flex items-center gap-1">
                              <Camera size={8}/> {pack.cameraName}
                           </div>
                        </div>

                        <div className="space-y-1">
                           <div className="flex justify-between text-xs">
                              <span className="text-slate-400">ID:</span>
                              <span className="text-slate-200 font-mono truncate max-w-[100px]">{pack.packId}</span>
                           </div>
                           {pack.metadata.attributes?.trackId && (
                              <div className="flex justify-between text-xs">
                                 <span className="text-slate-400">Track:</span>
                                 <span className="text-primary-400 font-mono">{pack.metadata.attributes.trackId}</span>
                              </div>
                           )}
                           <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Conf:</span>
                              <span className="text-green-400 font-bold">{Math.floor(pack.metadata.confidence * 100)}%</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Details Panel (Right Slide-over) */}
         {selectedPack && (
            <div className="w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-10 animate-fade-in">
               {/* Panel Header */}
               <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                  <div>
                     <h3 className="font-bold text-white text-lg leading-tight">รายละเอียด {selectedPack.eventType}</h3>
                     <p className="text-xs text-slate-500 font-mono mt-1">{selectedPack.packId}</p>
                  </div>
                  <button onClick={() => setSelectedPack(null)} className="text-slate-500 hover:text-white"><X size={20}/></button>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-slate-800">
                  <button onClick={() => setDetailTab('ASSETS')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${detailTab === 'ASSETS' ? 'text-white border-b-2 border-primary-500' : 'text-slate-500 hover:bg-slate-800'}`}>ไฟล์ประกอบ</button>
                  <button onClick={() => setDetailTab('LEDGER')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${detailTab === 'LEDGER' ? 'text-white border-b-2 border-primary-500' : 'text-slate-500 hover:bg-slate-800'}`}>ลำดับการครอบครอง</button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                  {detailTab === 'ASSETS' ? (
                     <>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                           <video src={selectedPack.videoUrl} className="w-full h-full object-contain" controls />
                        </div>

                        <div className="space-y-4">
                           <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">วิเคราะห์ Metadata</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                 <div className="text-slate-500">เวลา</div>
                                 <div className="text-slate-200 text-right">{selectedPack.timestamp.toLocaleString()}</div>
                                 <div className="text-slate-500">โซน</div>
                                 <div className="text-slate-200 text-right">{selectedPack.metadata.zoneName}</div>
                                 <div className="text-slate-500">จำนวนวัตถุ</div>
                                 <div className="text-slate-200 text-right">{selectedPack.metadata.objectCount}</div>
                                 <div className="text-slate-500">สี</div>
                                 <div className="text-slate-200 text-right">{selectedPack.metadata.attributes?.color?.join(', ') || '-'}</div>
                                 <div className="text-slate-500">ทิศทาง</div>
                                 <div className="text-slate-200 text-right">{selectedPack.metadata.attributes?.direction || '-'}</div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <button onClick={() => handleExport('PDF')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-700 flex items-center justify-center gap-2">
                                 <Printer size={14} /> สร้างรายงาน PDF
                              </button>
                              <button onClick={() => handleExport('ZIP')} className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded text-xs font-bold shadow-lg flex items-center justify-center gap-2">
                                 <Download size={14} /> ดาวน์โหลดหลักฐาน
                              </button>
                           </div>
                        </div>
                     </>
                  ) : (
                     <div className="space-y-6">
                        <div className={`p-4 rounded-lg border ${verifyState === 'SECURE' ? 'bg-green-900/10 border-green-500/30' : verifyState === 'TAMPERED' ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                           <div className="flex justify-between items-center mb-2">
                              <h4 className={`font-bold text-sm flex items-center gap-2 ${verifyState === 'SECURE' ? 'text-green-400' : verifyState === 'TAMPERED' ? 'text-red-400' : 'text-white'}`}>
                                 {verifyState === 'SECURE' ? <CheckCircle size={16}/> : verifyState === 'TAMPERED' ? <AlertTriangle size={16}/> : <ShieldCheck size={16} />}
                                 ตรวจสอบความถูกต้อง
                              </h4>
                              {verifyState === 'IDLE' && <button onClick={handleVerifyIntegrity} className="text-[10px] bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 text-white">ตรวจสอบเลย</button>}
                           </div>
                           <p className="text-xs text-slate-400">
                              {verifyState === 'IDLE' && 'คลิกเพื่อตรวจสอบค่า Hash และลายเซ็นดิจิทัล'}
                              {verifyState === 'VERIFYING' && 'กำลังคำนวณ SHA-256... ตรวจสอบ Digital Signature...'}
                              {verifyState === 'SECURE' && 'ผ่าน: ลายเซ็นดิจิทัลถูกต้อง ตรงกับต้นฉบับ'}
                              {verifyState === 'TAMPERED' && 'วิกฤต: พบค่า Hash ไม่ตรงกัน! ไฟล์อาจถูกดัดแปลง'}
                           </p>
                        </div>

                        <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                           {selectedPack.manifest?.ledger.map((entry, i) => (
                              <div key={i} className="relative">
                                 <div className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 ${entry.action === 'GENERATED' ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-primary-500'}`}></div>
                                 <div className="text-xs text-slate-500 font-mono mb-1">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                 <div className="bg-slate-800/50 p-2 rounded border border-slate-800">
                                    <div className="font-bold text-slate-200 text-xs flex justify-between">
                                       <span>{entry.action}</span>
                                       <span className="text-slate-500">{entry.actor}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-mono truncate">Hash: {entry.currHash.substring(0, 16)}...</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>

      {/* Config Modal (Simplified) */}
      {showConfig && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><HardDrive size={18}/> ตั้งค่าพื้นที่จัดเก็บ</h3>
               <p className="text-sm text-slate-400 mb-6">จัดการนโยบายการเก็บรักษาข้อมูลและดัชนีการค้นหา</p>
               <button onClick={() => setShowConfig(false)} className="w-full py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-700">ปิด</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default EvidenceVault;
