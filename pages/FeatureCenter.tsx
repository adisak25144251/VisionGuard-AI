
import React, { useState, useEffect } from 'react';
import { Plus, Power, Edit3, Trash2, Play, Check, ChevronRight, Zap, Shield, Users, AlertTriangle, Eye, Clock, LayoutGrid, Settings, X, MousePointer2 } from 'lucide-react';
import { MOCK_CAMERAS } from '../constants';
import { generateMockRules } from '../services/mockAiService';
import { RuleConfig, FeatureType } from '../types';

const FeatureCenter: React.FC = () => {
  const [rules, setRules] = useState<RuleConfig[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'timeline'>('rules');

  // Load from Storage or Seed
  useEffect(() => {
    const savedRules = localStorage.getItem('visionguard_rules');
    if (savedRules) {
        // Hydrate dates properly
        const parsed = JSON.parse(savedRules).map((r: any) => ({
            ...r,
            lastTriggered: r.lastTriggered ? new Date(r.lastTriggered) : undefined
        }));
        setRules(parsed);
    } else {
        const initial = generateMockRules();
        setRules(initial);
        localStorage.setItem('visionguard_rules', JSON.stringify(initial));
    }
  }, []);

  const saveRules = (newRules: RuleConfig[]) => {
      setRules(newRules);
      localStorage.setItem('visionguard_rules', JSON.stringify(newRules));
  };

  const toggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    saveRules(updated);
  };

  const deleteRule = (id: string) => {
    if (confirm('คุณต้องการลบกฎการตรวจจับนี้ใช่หรือไม่?')) {
        const updated = rules.filter(r => r.id !== id);
        saveRules(updated);
    }
  };

  // --- WIZARD STATE ---
  const [wizardStep, setWizardStep] = useState(1);
  const [newRule, setNewRule] = useState<Partial<RuleConfig>>({
    name: '',
    sensitivity: 50,
    alerts: [],
    isActive: true,
    schedule: 'Always'
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [roiPoints, setRoiPoints] = useState<{x: number, y: number}[]>([]);

  const handleCreateRule = () => {
    const rule: RuleConfig = {
      id: `rule-${Date.now()}`,
      name: newRule.name || 'New AI Rule',
      cameraId: newRule.cameraId || '',
      cameraName: MOCK_CAMERAS.find(c => c.id === newRule.cameraId)?.name || 'Unknown',
      featureType: newRule.featureType || 'INTRUSION',
      isActive: true,
      sensitivity: newRule.sensitivity || 50,
      schedule: newRule.schedule || 'Always',
      alerts: newRule.alerts || [],
      lastTriggered: new Date() // Just to show it's active
    };
    saveRules([...rules, rule]);
    setShowWizard(false);
    setWizardStep(1);
    setRoiPoints([]);
    setNewRule({ name: '', sensitivity: 50, alerts: [], isActive: true, schedule: 'Always' });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setRoiPoints([...roiPoints, { x, y }]);
  };

  const WizardStep1_Camera = () => (
    <div className="grid grid-cols-2 gap-4">
      {MOCK_CAMERAS.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 p-8 border border-dashed border-slate-700 rounded-lg">
              <p className="mb-2 text-sm">No cameras available.</p> 
              <p className="text-xs">Please add camera devices in the Settings page first.</p>
          </div>
      )}
      {MOCK_CAMERAS.map(cam => (
        <div 
          key={cam.id} 
          onClick={() => setNewRule({ ...newRule, cameraId: cam.id })}
          className={`cursor-pointer rounded-lg border-2 overflow-hidden relative group ${newRule.cameraId === cam.id ? 'border-primary-500' : 'border-slate-800 hover:border-slate-600'}`}
        >
          <img src={cam.url} className="w-full h-32 object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            {newRule.cameraId === cam.id && <div className="bg-primary-500 rounded-full p-2"><Check size={24} className="text-white" /></div>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-xs font-bold text-white truncate">{cam.name}</div>
        </div>
      ))}
    </div>
  );

  const WizardStep2_Feature = () => {
    const features: {type: FeatureType, label: string, icon: any, desc: string}[] = [
      { type: 'LOITERING', label: 'ตรวจจับการเตร็ดเตร่ (Loitering)', icon: Clock, desc: 'แจ้งเตือนเมื่อพบบุคคลอยู่นิ่งนานผิดปกติ' },
      { type: 'QUEUE', label: 'บริหารคิว (Queue Management)', icon: Users, desc: 'แจ้งเตือนเมื่อแถวยาวเกินกำหนด' },
      { type: 'INTRUSION', label: 'การบุกรุก (Intrusion)', icon: Shield, desc: 'ตรวจจับการเข้าพื้นที่หวงห้าม 24/7' },
      { type: 'FALL', label: 'คนล้ม (Fall Detection)', icon: AlertTriangle, desc: 'แจ้งเตือนอุบัติเหตุล้มในพื้นที่' },
    ];

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
           {['Retail', 'Factory', 'Home', 'Street'].map(preset => (
             <button 
                key={preset}
                onClick={() => setSelectedPreset(preset)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedPreset === preset ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'}`}
             >
               {preset}
             </button>
           ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(f => (
            <div 
              key={f.type} 
              onClick={() => setNewRule({ ...newRule, featureType: f.type, name: `${f.label} - ${selectedPreset || 'Custom'}` })}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${newRule.featureType === f.type ? 'bg-primary-600/20 border-primary-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
            >
              <div className="flex items-center mb-2">
                <f.icon className={newRule.featureType === f.type ? 'text-primary-400' : 'text-slate-400'} size={20} />
                <span className={`ml-2 font-semibold ${newRule.featureType === f.type ? 'text-white' : 'text-slate-300'}`}>{f.label}</span>
              </div>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WizardStep3_Config = () => (
    <div className="space-y-6">
      <div className="relative w-full h-48 bg-black rounded-lg border border-slate-700 overflow-hidden cursor-crosshair" onClick={handleCanvasClick}>
        <img src={MOCK_CAMERAS.find(c => c.id === newRule.cameraId)?.url || 'https://picsum.photos/800/400'} className="w-full h-full object-cover opacity-50" />
        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex items-center">
          <MousePointer2 size={12} className="mr-1" /> คลิกเพื่อวาดพื้นที่สนใจ (ROI)
        </div>
        
        {/* Drawn Polygon */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polygon 
             points={roiPoints.map(p => `${p.x}%,${p.y}%`).join(' ')} 
             className="fill-red-500/20 stroke-red-500 stroke-2"
          />
          {roiPoints.map((p, i) => (
            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="3" className="fill-white" />
          ))}
        </svg>
      </div>

      <div className="space-y-4 px-2">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">ความไวในการตรวจจับ (Sensitivity)</span>
            <span className="text-primary-400 font-bold">{newRule.sensitivity}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="100" 
            value={newRule.sensitivity} 
            onChange={(e) => setNewRule({...newRule, sensitivity: parseInt(e.target.value)})}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Low (ลด Noise)</span>
            <span>High (ตรวจจับเร็ว)</span>
          </div>
        </div>

        <div>
           <label className="text-sm text-slate-300 mb-2 block">ช่วงเวลาทำงาน (Schedule)</label>
           <select 
             value={newRule.schedule}
             onChange={(e) => setNewRule({...newRule, schedule: e.target.value})}
             className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
           >
             <option>ตลอดเวลา (24/7)</option>
             <option>เวลางาน (08:00 - 18:00)</option>
             <option>กะดึก (20:00 - 06:00)</option>
             <option>เฉพาะวันหยุด</option>
           </select>
        </div>
      </div>
    </div>
  );

  const WizardStep4_Alerts = () => (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 text-green-500 rounded mr-3"><Users size={18} /></div>
            <div>
              <h4 className="text-sm font-bold text-white">LINE Notify</h4>
              <p className="text-xs text-slate-400">ส่งรูปภาพเข้ากลุ่มไลน์</p>
            </div>
          </div>
          <input type="checkbox" className="accent-primary-500 w-5 h-5" defaultChecked />
        </div>
        <input type="text" placeholder="วาง LINE Token ที่นี่..." className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 mt-2" />
      </div>

      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 text-blue-500 rounded mr-3"><Zap size={18} /></div>
            <div>
              <h4 className="text-sm font-bold text-white">Webhook</h4>
              <p className="text-xs text-slate-400">เชื่อมต่อ API ภายนอก</p>
            </div>
          </div>
          <input type="checkbox" className="accent-primary-500 w-5 h-5" />
        </div>
        <input type="text" placeholder="https://api.your-system.com/hooks/..." className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 mt-2" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">ศูนย์จัดการฟีเจอร์อัจฉริยะ</h1>
          <p className="text-slate-400 mt-1">ตั้งค่ากฎ AI, พื้นที่เสมือน (Virtual Fences) และการแจ้งเตือนอัตโนมัติ</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-slate-800 p-1 rounded-lg">
             <button onClick={() => setActiveTab('rules')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'rules' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>กฎที่ใช้งานอยู่</button>
             <button onClick={() => setActiveTab('timeline')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'timeline' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>ไทม์ไลน์</button>
           </div>
           <button 
             onClick={() => setShowWizard(true)}
             className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-900/20"
           >
             <Plus size={18} />
             <span>สร้างกฎใหม่</span>
           </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'rules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
                <div key={rule.id} className={`glass-panel p-5 rounded-xl border transition-all hover:border-slate-600 ${rule.isActive ? 'border-slate-700' : 'border-slate-800 opacity-70'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${rule.isActive ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500'}`}>
                        {rule.featureType === 'LOITERING' && <Clock size={20} />}
                        {rule.featureType === 'QUEUE' && <Users size={20} />}
                        {rule.featureType === 'INTRUSION' && <Shield size={20} />}
                        {rule.featureType === 'PPE' && <AlertTriangle size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100">{rule.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                        <LayoutGrid size={10} /> {rule.cameraName}
                        </p>
                    </div>
                    </div>
                    <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-slate-700'}`}
                    >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/50 pt-4 mt-2">
                    <span className="flex items-center gap-1.5">
                    <Zap size={12} className={rule.lastTriggered ? 'text-yellow-500' : ''} />
                    ล่าสุด: {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleTimeString() : 'ไม่พบ'}
                    </span>
                    <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-white p-1"><Edit3 size={14} /></button>
                    <button onClick={() => deleteRule(rule.id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                    </div>
                </div>
                </div>
            ))}
            
            {/* Add New Placeholder */}
            <div 
                onClick={() => setShowWizard(true)}
                className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-primary-400 hover:border-primary-500/50 transition-all cursor-pointer min-h-[160px]"
            >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3">
                <Plus size={24} />
                </div>
                <span className="font-medium">เพิ่มกฎใหม่</span>
            </div>
            </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
            <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                {rules.slice(0, 3).map((rule, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-[.is-active]:bg-primary-600 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <AlertTriangle size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-200">{rule.name} แจ้งเตือน</div>
                        <time className="font-mono text-xs text-slate-500">2 นาทีที่แล้ว</time>
                        </div>
                        <div className="relative w-full h-32 bg-black rounded overflow-hidden mb-3 border border-slate-800 group-hover:border-primary-500/50 transition-colors">
                        <img src={MOCK_CAMERAS.length > 0 ? MOCK_CAMERAS[0].url : 'https://placehold.co/800x450?text=No+Camera'} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all"><Play fill="white" size={24} /></button>
                        </div>
                        </div>
                        <div className="text-xs text-slate-400">
                        ความแม่นยำ: <span className="text-green-400">98%</span>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
            </div>
        )}
      </div>

      {/* SETUP WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h2 className="text-xl font-bold text-white">ตัวช่วยสร้างกฎ (Configuration Wizard)</h2>
                <p className="text-xs text-slate-400 mt-1">ขั้นตอนที่ {wizardStep} จาก 4</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-800">
              <div className="h-full bg-primary-500 transition-all duration-300" style={{width: `${wizardStep * 25}%`}}></div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {wizardStep === 1 && <WizardStep1_Camera />}
              {wizardStep === 2 && <WizardStep2_Feature />}
              {wizardStep === 3 && <WizardStep3_Config />}
              {wizardStep === 4 && <WizardStep4_Alerts />}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between">
              <button 
                onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                disabled={wizardStep === 1}
                className={`px-4 py-2 rounded text-sm font-medium ${wizardStep === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                ย้อนกลับ
              </button>
              
              {wizardStep < 4 ? (
                <button 
                  onClick={() => setWizardStep(prev => Math.min(4, prev + 1))}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded text-sm font-bold flex items-center"
                >
                  ถัดไป <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button 
                  onClick={handleCreateRule}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold flex items-center shadow-lg shadow-green-900/20"
                >
                  <Check size={16} className="mr-2" /> เสร็จสิ้น & เปิดใช้งาน
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCenter;
