
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Search, ShieldAlert, User, Clock, MoreVertical, Trash2, Edit2, Filter, AlertOctagon, Check, RefreshCw, X, Camera } from 'lucide-react';
import { getRealFaceProfiles, getRealFaceEvents } from '../services/realApiService';
import { FaceProfile, FaceEvent, FaceCategory } from '../types';

const FaceRecognition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'database' | 'events'>('database');
  const [profiles, setProfiles] = useState<FaceProfile[]>([]);
  const [events, setEvents] = useState<FaceEvent[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [newPerson, setNewPerson] = useState<{name: string, category: FaceCategory, notes: string}>({
     name: '', category: 'STAFF', notes: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [pData, eData] = await Promise.all([getRealFaceProfiles(), getRealFaceEvents()]);
        setProfiles(pData);
        setEvents(eData);
    } catch(e) {
        console.error("Failed to load Face Data", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnroll = () => {
     if (!newPerson.name) {
       alert('กรุณาระบุชื่อ-นามสกุล');
       return;
     }
     
     // Create a new mock profile
     const newProfile: FaceProfile = {
       id: `new-${Date.now()}`,
       name: newPerson.name,
       category: newPerson.category,
       notes: newPerson.notes,
       lastSeen: new Date(),
       imageUrl: previewImage || 'https://via.placeholder.com/150' // Fallback or uploaded image
     };

     setProfiles(prev => [newProfile, ...prev]);
     
     // Reset and Close
     setNewPerson({ name: '', category: 'STAFF', notes: '' });
     setPreviewImage(null);
     setShowEnrollModal(false);
  };

  const handleDelete = (id: string) => {
     if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลใบหน้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        setProfiles(prev => prev.filter(p => p.id !== id));
     }
  };

  const getCategoryColor = (cat: FaceCategory) => {
    switch (cat) {
      case 'VIP': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'BLACKLIST': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'STAFF': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'VISITOR': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  const filteredProfiles = profiles.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            ระบบจดจำใบหน้า
            {isLoading && <RefreshCw size={18} className="animate-spin text-slate-500" />}
          </h1>
          <p className="text-slate-400 mt-1">จัดการฐานข้อมูลใบหน้า ลงทะเบียนบุคคล และตรวจสอบประวัติการเข้าออก</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setActiveTab('database')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            ฐานข้อมูล ({profiles.length})
          </button>
          <button 
             onClick={() => setActiveTab('events')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'events' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            ประวัติการเข้าออก
          </button>
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors ml-2 shadow-lg shadow-emerald-900/20"
          >
            <UserPlus size={16} />
            <span>ลงทะเบียนใบหน้า</span>
          </button>
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
             <h3 className="text-xl font-bold text-white mb-4">ลงทะเบียนบุคคลใหม่</h3>
             <div className="space-y-4">
               
               {/* Image Upload Area */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 transition-colors cursor-pointer relative overflow-hidden group ${previewImage ? 'border-primary-500' : 'border-slate-700 hover:border-primary-500 hover:text-primary-400 bg-slate-950/50'}`}
               >
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                 />
                 
                 {previewImage ? (
                    <>
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex flex-col items-center text-white">
                            <Camera size={24} className="mb-1"/>
                            <span className="text-xs">เปลี่ยนรูปภาพ</span>
                         </div>
                      </div>
                    </>
                 ) : (
                    <>
                      <UserPlus size={32} className="mb-2" />
                      <span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span>
                      <span className="text-[10px] mt-1 text-slate-600">รองรับ .JPG, .PNG</span>
                    </>
                 )}
               </div>

               <div>
                 <label className="block text-xs text-slate-400 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={newPerson.name}
                   onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                   className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none" 
                   placeholder="เช่น สมชาย ใจดี" 
                 />
               </div>
               <div>
                 <label className="block text-xs text-slate-400 mb-1">ประเภทบุคคล</label>
                 <select 
                   value={newPerson.category}
                   onChange={(e) => setNewPerson({...newPerson, category: e.target.value as FaceCategory})}
                   className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                 >
                   <option value="STAFF">พนักงาน (STAFF)</option>
                   <option value="VIP">แขกวีไอพี (VIP)</option>
                   <option value="BLACKLIST">บัญชีดำ (BLACKLIST)</option>
                   <option value="VISITOR">ผู้มาติดต่อ (VISITOR)</option>
                 </select>
               </div>
               <div>
                  <label className="block text-xs text-slate-400 mb-1">หมายเหตุ (ถ้ามี)</label>
                  <input 
                    type="text" 
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson({...newPerson, notes: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none" 
                    placeholder="แผนก, รหัสพนักงาน..." 
                  />
               </div>
               <div className="flex gap-3 mt-6">
                 <button onClick={() => setShowEnrollModal(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">ยกเลิก</button>
                 <button 
                    onClick={handleEnroll} 
                    disabled={!newPerson.name}
                    className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded flex items-center justify-center gap-2"
                 >
                    <Check size={16} /> บันทึกข้อมูล
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* DATABASE TAB */}
      {activeTab === 'database' && (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ หรือประเภท..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-primary-500 transition-colors" 
              />
            </div>
            <div className="flex gap-2">
               <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Filter size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {filteredProfiles.map(profile => (
                <div key={profile.id} className="glass-panel p-4 rounded-xl border border-slate-700/50 group hover:border-primary-500/30 transition-all relative">
                    <div className="flex items-start justify-between mb-4">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold border ${getCategoryColor(profile.category)}`}>
                        {profile.category}
                    </div>
                    <button 
                        onClick={() => handleDelete(profile.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-800 mb-3 relative">
                        <img src={profile.imageUrl} alt={profile.name} className="w-full h-full rounded-full object-cover border-2 border-slate-900" />
                        {profile.category === 'BLACKLIST' && (
                        <div className="absolute bottom-0 right-0 p-1.5 bg-red-500 rounded-full border-2 border-slate-900 text-white shadow-sm">
                            <AlertOctagon size={12} />
                        </div>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{profile.notes || '-'}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-800/50 w-full flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> พบล่าสุด</span>
                        <span>{new Date(profile.lastSeen).toLocaleDateString()}</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 flex-1 min-h-0 flex flex-col">
           <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-300 border-b border-slate-700 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-4">บุคคล</th>
                    <th className="px-6 py-4">ภาพที่จับได้</th>
                    <th className="px-6 py-4">เวลา</th>
                    <th className="px-6 py-4">กล้อง</th>
                    <th className="px-6 py-4">ความเชื่อมั่น</th>
                    <th className="px-6 py-4 text-center">การอนุญาต</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                            <img src={evt.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-200">{evt.name}</div>
                            <div className={`text-[10px] inline-block px-1.5 rounded border mt-0.5 ${getCategoryColor(evt.category)}`}>{evt.category}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-3">
                        <div className="w-16 h-10 bg-black rounded border border-slate-700 overflow-hidden relative">
                        <img src={evt.imageUrl} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-yellow-500/50 rounded-sm"></div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-300">{evt.timestamp.toLocaleTimeString()}</td>
                    <td className="px-6 py-3">{evt.cameraName}</td>
                    <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${evt.confidence > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${evt.confidence * 100}%`}}></div>
                        </div>
                        <span className="text-xs">{(evt.confidence * 100).toFixed(0)}%</span>
                        </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                        {evt.category === 'BLACKLIST' ? (
                        <span className="flex items-center justify-center text-red-500 font-bold text-xs"><ShieldAlert size={14} className="mr-1" /> ห้ามเข้า</span>
                        ) : evt.category === 'UNKNOWN' ? (
                        <span className="text-slate-500 text-xs">-</span>
                        ) : (
                        <span className="text-green-500 text-xs">อนุญาต</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
