import React, { useState, useEffect } from 'react';
import { 
  Save, Server, Camera, Bell, Users, Shield, 
  Cpu, HardDrive, Globe, Plus, Trash2, Edit2, 
  Loader2, Check, X, AlertCircle, Smartphone, 
  Monitor, QrCode, Video, Wifi, Timer, RotateCcw,
  Zap, Link, Sliders, Activity, Mail, MessageSquare,
  Lock, Key, Database, Cloud, AlertTriangle, FileText,
  Clock, EyeOff, FileSignature, Fingerprint, ShieldCheck, Network,
  ChevronRight, ChevronLeft, CheckCircle2, XCircle, Search, RefreshCw,
  ShieldAlert, Power, Moon, Sun, Laptop, KeyRound, Terminal, Eye,
  Settings as SettingsIcon, MoreHorizontal, LogOut, Scan, ArrowRight, ExternalLink, Copy, AlertOctagon
} from 'lucide-react';
import { MOCK_CAMERAS } from '../constants';
import { generateAccessLogs, getRetentionRules } from '../services/mockAiService';
import { CameraStatus, Camera as CameraType, PrivacyConfig, AccessLog, RetentionRule } from '../types';

// --- TYPES FOR SETTINGS STATE ---
interface GlobalConfig {
  systemName: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
}

interface AIConfig {
  personThreshold: number;
  vehicleThreshold: number;
  faceThreshold: number;
  weaponThreshold: number;
}

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: 'Administrator' | 'Operator' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- 1. GLOBAL CONFIG STATE ---
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    systemName: 'VisionGuard HQ',
    language: 'English (US)',
    timezone: 'Asia/Bangkok (GMT+7)',
    maintenanceMode: false
  });

  // --- 2. PRIVACY STATE ---
  const [privacyConfig, setPrivacyConfig] = useState<PrivacyConfig>({
    autoBlurFaces: true,
    autoBlurPlates: true,
    blurPrivateZones: true,
    requireReasonForUnmask: true,
    watermarkUserIdentity: true,
    pdpaNoticeText: "พื้นที่นี้มีการบันทึกภาพด้วยกล้องวงจรปิดเพื่อการรักษาความปลอดภัย..."
  });

  // --- 3. CAMERA STATE ---
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isPairing, setIsPairing] = useState(false); // Mobile Pairing Mode
  
  // NEW: Pairing ID and Base URL State
  const [pairingId, setPairingId] = useState('');
  const [pairingBaseUrl, setPairingBaseUrl] = useState('');
  const [isSandbox, setIsSandbox] = useState(false); // Detect restricted environment
  
  // Webcam Scanning State
  const [availableWebcams, setAvailableWebcams] = useState<MediaDeviceInfo[]>([]);

  const [editingCamId, setEditingCamId] = useState<string | null>(null);
  const [camForm, setCamForm] = useState({
    name: '', ip: '', location: '', type: 'RTSP', url: ''
  });

  // --- 4. AI STATE ---
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    personThreshold: 0.75,
    vehicleThreshold: 0.80,
    faceThreshold: 0.85,
    weaponThreshold: 0.90
  });

  // --- 5. USERS STATE ---
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 1, name: 'Admin User', email: 'admin@visionguard.ai', role: 'Administrator', lastLogin: 'Just now', status: 'Active' },
    { id: 2, name: 'Security Chief', email: 'chief@visionguard.ai', role: 'Operator', lastLogin: '2h ago', status: 'Active' },
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Operator' });

  // --- 6. DATA STATE ---
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [retentionRules, setRetentionRules] = useState<RetentionRule[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true, push: true, line: false, desktop: true
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Load Logs & Rules (Mock)
    setAccessLogs(generateAccessLogs(10));
    setRetentionRules(getRetentionRules());

    // Load Cameras
    const savedCams = localStorage.getItem('visionguard_cameras');
    if (savedCams) {
        setCameras(JSON.parse(savedCams));
    } else {
        setCameras(MOCK_CAMERAS);
    }

    // Load Global Config (Mock Persistence)
    const savedGlobal = localStorage.getItem('visionguard_global');
    if (savedGlobal) setGlobalConfig(JSON.parse(savedGlobal));
    
    // Load Users
    const savedUsers = localStorage.getItem('visionguard_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    // Detect Environment Restrictions
    const h = window.location.hostname;
    if (
        h.includes('googleusercontent') || 
        h.includes('webcontainer') || 
        h.includes('stackblitz') || 
        h.includes('codesandbox') ||
        h.includes('github.dev')
    ) {
        setIsSandbox(true);
    }

  }, []);

  // --- HELPERS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    // Persist all critical states
    localStorage.setItem('visionguard_cameras', JSON.stringify(cameras));
    localStorage.setItem('visionguard_global', JSON.stringify(globalConfig));
    localStorage.setItem('visionguard_users', JSON.stringify(users));
    
    // Simulate Network Delay
    setTimeout(() => {
        setIsSaving(false);
        showToast("System Configuration Saved Successfully");
    }, 1200);
  };

  // --- CAMERA HANDLERS ---
  const openAddCamera = () => {
    setEditingCamId(null);
    setCamForm({ name: '', ip: '', location: '', type: 'RTSP', url: '' });
    setIsPairing(false);
    setAvailableWebcams([]); // Reset webcams
    setShowCameraModal(true);
  };

  const openEditCamera = (cam: CameraType) => {
    setEditingCamId(cam.id);
    setCamForm({
        name: cam.name,
        ip: cam.ipAddress,
        location: cam.location,
        type: cam.streamType,
        url: cam.url
    });
    setIsPairing(false);
    
    // If editing a webcam, scan to populate dropdown
    if (cam.streamType === 'WEBCAM') {
        handleScanWebcams();
    } else {
        setAvailableWebcams([]);
    }
    
    setShowCameraModal(true);
  };

  const handleScanWebcams = async () => {
      try {
          // Request permission first to ensure labels are available
          await navigator.mediaDevices.getUserMedia({ video: true });
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setAvailableWebcams(videoInputs);
          
          if (videoInputs.length > 0) {
              // If creating new, auto-select first one
              if (!editingCamId) {
                  setCamForm(prev => ({
                      ...prev,
                      name: videoInputs[0].label || `Webcam ${videoInputs.length}`,
                      ip: '127.0.0.1',
                      location: 'Local Console',
                      type: 'WEBCAM',
                      url: videoInputs[0].deviceId
                  }));
              }
              showToast(`Found ${videoInputs.length} webcam(s)`);
          } else {
              showToast("No webcams found");
          }
      } catch (err) {
          console.error(err);
          showToast("Camera permission denied");
      }
  };

  const handleSaveCamera = () => {
    if (!camForm.name) return;

    if (editingCamId) {
        // Update existing
        setCameras(prev => prev.map(c => c.id === editingCamId ? {
            ...c,
            name: camForm.name,
            ipAddress: camForm.ip,
            location: camForm.location,
            streamType: camForm.type,
            url: camForm.url || c.url
        } : c));
        showToast(`Camera "${camForm.name}" updated`);
    } else {
        // Create new
        const newCam: CameraType = {
            id: (camForm.type === 'WEBRTC' || camForm.type === 'WEBCAM') ? `${camForm.type.toLowerCase()}-${Date.now()}` : `cam-${Date.now()}`,
            name: camForm.name,
            location: camForm.location || 'Default Zone',
            ipAddress: camForm.ip,
            macAddress: '00:00:00:00:00:00',
            status: 'ONLINE',
            url: camForm.url || `https://picsum.photos/800/450?random=${Date.now()}`,
            streamType: camForm.type,
            features: ['Intrusion'],
            security: MOCK_CAMERAS[0]?.security || {
                encryption: 'AES-256',
                authMethod: 'BASIC',
                firmwareVersion: '1.0.0',
                lastSecurityAudit: new Date(),
                zeroTrustEnabled: false,
                isDefaultCreds: false,
                httpsEnabled: true,
                portExposed: false,
                failedLoginCount: 0
            },
            forensics: MOCK_CAMERAS[0]?.forensics || {
                watermarkEnabled: false,
                watermarkText: '',
                digitalSignature: false,
                rollingHash: false,
                retentionPolicy: '30_DAYS'
            },
            privacyMasks: [],
            activeModels: []
        };
        setCameras(prev => [...prev, newCam]);
        showToast("New Device Added");
    }
    setShowCameraModal(false);
  };

  const handleDeleteCamera = (id: string) => {
    if(confirm('Are you sure? This will remove the device and its history.')) {
        setCameras(prev => prev.filter(c => c.id !== id));
        showToast("Device Removed");
    }
  };

  // ... (Keep existing Mobile Pairing Handlers: startMobilePairing, getFullPairingUrl, copyToClipboard)
  const startMobilePairing = () => {
      const id = `mob-${Math.floor(Math.random()*100000)}`;
      setPairingId(id);
      
      // Attempt to guess the best URL
      let currentUrl = window.location.href;
      
      // FIX: Clean 'blob:' prefix if present (Common in StackBlitz/WebContainers)
      if (currentUrl.startsWith('blob:')) {
          currentUrl = currentUrl.replace('blob:', '');
      }
      
      // Clean hash and params
      currentUrl = currentUrl.split('#')[0].split('?')[0];
      
      if (!currentUrl.endsWith('/')) currentUrl += '/';
      
      setPairingBaseUrl(currentUrl);
      setIsPairing(true);
      
      // Auto-fill form for the user
      setCamForm({
          name: `Mobile Unit ${id.split('-')[1]}`,
          ip: 'Mobile 5G/WiFi',
          location: 'Roaming',
          type: 'WEBRTC', 
          url: id 
      });
  };

  const getFullPairingUrl = () => {
      let base = pairingBaseUrl;
      if (!base.endsWith('/')) base += '/';
      return `${base}#/mobile-sender?id=${pairingId}`;
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(getFullPairingUrl());
      showToast("URL Copied to Clipboard");
  };

  // ... (Keep existing User Handlers: handleInviteUser, handleDeleteUser)
  const handleInviteUser = () => {
      if (!userForm.name || !userForm.email) return;
      const newUser: UserAccount = {
          id: Date.now(),
          name: userForm.name,
          email: userForm.email,
          role: userForm.role as any,
          status: 'Pending',
          lastLogin: '-'
      };
      setUsers(prev => [...prev, newUser]);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'Operator' });
      showToast(`Invitation sent to ${newUser.email}`);
  };

  const handleDeleteUser = (id: number) => {
      if (confirm('Revoke access for this user?')) {
          setUsers(prev => prev.filter(u => u.id !== id));
          showToast("User Access Revoked");
      }
  };

  // ... (Keep ToggleItem, TabPrivacy, renderContent switch logic)
  // --- SUB-COMPONENTS ---
  const ToggleItem = ({label, checked, onChange, desc}: any) => (
    <div className="flex items-start justify-between p-2 hover:bg-slate-800/30 rounded transition-colors cursor-pointer" onClick={() => onChange && onChange(!checked)}>
       <div className="pr-4">
          <div className="text-sm font-bold text-slate-200">{label}</div>
          {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
       </div>
       <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-primary-600' : 'bg-slate-700'}`}>
          <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-6' : 'left-1'}`}></div>
       </div>
    </div>
  );

  const TabPrivacy = () => (
    <div className="space-y-8 animate-fade-in">
       {/* 1. Masking Policy */}
       <div className="glass-panel p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <EyeOff size={18} className="text-primary-400"/> Smart Masking Policy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <ToggleItem 
                   label="Auto-Blur Faces" 
                   desc="Blur detected faces in live/recorded streams."
                   checked={privacyConfig.autoBlurFaces}
                   onChange={(v: boolean) => setPrivacyConfig({...privacyConfig, autoBlurFaces: v})}
                />
                <ToggleItem 
                   label="Auto-Blur License Plates" 
                   desc="Mask vehicle license plates."
                   checked={privacyConfig.autoBlurPlates}
                   onChange={(v: boolean) => setPrivacyConfig({...privacyConfig, autoBlurPlates: v})}
                />
                <ToggleItem 
                   label="Private Zone Masking" 
                   desc="Blackout sensitive areas (windows, toilets)."
                   checked={privacyConfig.blurPrivateZones}
                   onChange={(v: boolean) => setPrivacyConfig({...privacyConfig, blurPrivateZones: v})}
                />
             </div>
             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col justify-center items-center text-center">
                <div className="relative w-full max-w-xs aspect-video bg-black rounded overflow-hidden mb-2 group">
                   <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60" />
                   {privacyConfig.autoBlurFaces && (
                      <div className="absolute top-[20%] left-[45%] w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center">
                          <EyeOff size={16} className="text-white/50"/>
                      </div>
                   )}
                </div>
                <p className="text-xs text-slate-500">Preview: {privacyConfig.autoBlurFaces ? 'Masking Active' : 'Masking Off'}</p>
             </div>
          </div>
       </div>

       {/* 2. Access Control */}
       <div className="glass-panel p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Key size={18} className="text-yellow-400"/> Access Control & Audit
          </h3>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             <ToggleItem 
                label="Require Reason for Unmasking" 
                desc="Force users to input a reason to see unblurred footage."
                checked={privacyConfig.requireReasonForUnmask}
                onChange={(v: boolean) => setPrivacyConfig({...privacyConfig, requireReasonForUnmask: v})}
             />
             <ToggleItem 
                label="Watermark User Identity" 
                desc="Overlay viewer's ID/IP on video stream."
                checked={privacyConfig.watermarkUserIdentity}
                onChange={(v: boolean) => setPrivacyConfig({...privacyConfig, watermarkUserIdentity: v})}
             />
          </div>
          
          {/* Logs Table */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
             <div className="p-3 border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Access Logs</span>
                <button className="text-primary-400 hover:text-white flex items-center gap-1"><RefreshCw size={10}/> Refresh</button>
             </div>
             <div className="max-h-48 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                   <thead className="text-slate-500 bg-slate-900 sticky top-0">
                      <tr>
                         <th className="p-3">Time</th>
                         <th className="p-3">User</th>
                         <th className="p-3">Action</th>
                         <th className="p-3">Reason</th>
                      </tr>
                   </thead>
                   <tbody className="text-slate-300 divide-y divide-slate-800">
                      {accessLogs.map(log => (
                         <tr key={log.id}>
                            <td className="p-3 font-mono text-slate-500">{log.timestamp.toLocaleTimeString()}</td>
                            <td className="p-3 font-bold">{log.userName}</td>
                            <td className="p-3">
                               <span className={`px-2 py-0.5 rounded ${log.action === 'UNMASK_VIDEO' ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                  {log.action}
                               </span>
                            </td>
                            <td className="p-3 text-slate-400 italic">{log.reason || '-'}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
        case 'privacy': return <TabPrivacy />;
        case 'general': return (
            <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-400"/> Global Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">System Name</label>
                                <input 
                                    type="text" 
                                    value={globalConfig.systemName}
                                    onChange={(e) => setGlobalConfig({...globalConfig, systemName: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-primary-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Language</label>
                                <select 
                                    value={globalConfig.language}
                                    onChange={(e) => setGlobalConfig({...globalConfig, language: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-primary-500 outline-none"
                                >
                                    <option>English (US)</option>
                                    <option>Thai (TH)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Timezone</label>
                                <select 
                                    value={globalConfig.timezone}
                                    onChange={(e) => setGlobalConfig({...globalConfig, timezone: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-primary-500 outline-none"
                                >
                                    <option>Asia/Bangkok (GMT+7)</option>
                                    <option>UTC</option>
                                    <option>New York (GMT-5)</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div>
                                    <div className="text-sm font-bold text-white">Maintenance Mode</div>
                                    <div className="text-xs text-slate-500">Suspend alerts & recording</div>
                                </div>
                                <ToggleItem 
                                    checked={globalConfig.maintenanceMode} 
                                    onChange={(v: boolean) => setGlobalConfig({...globalConfig, maintenanceMode: v})} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
        case 'cameras': return (
            <div className="space-y-6 animate-fade-in relative">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white">Connected Cameras</h3>
                        <p className="text-xs text-slate-400">Total Devices: {cameras.length}</p>
                    </div>
                    <button 
                        onClick={openAddCamera}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-500 flex items-center gap-2 shadow-lg shadow-primary-900/20"
                    >
                        <Plus size={16}/> Add Device
                    </button>
                </div>

                <div className="glass-panel rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Name / ID</th>
                                <th className="p-4">IP / Location</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {cameras.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/50 group">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{c.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{c.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono text-xs text-slate-300">{c.ipAddress}</div>
                                        <div className="text-xs text-slate-500">{c.location}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">{c.streamType}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border flex w-fit items-center gap-1 ${
                                            c.status === 'ONLINE' || c.status === 'RECORDING' 
                                            ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                                            : c.status === 'ALERT'
                                            ? 'bg-red-900/20 text-red-400 border-red-900/50'
                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'ONLINE' || c.status === 'RECORDING' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditCamera(c)} className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Configure">
                                                <SettingsIcon size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCamera(c.id)}
                                                className="p-1.5 hover:bg-red-900/30 rounded text-slate-300 hover:text-red-400" title="Delete"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {cameras.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No cameras connected. Click "Add Device" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
        // ... (Other cases: 'ai', 'users', 'notifications', 'storage' - Keep existing implementations)
        case 'ai': return (
            <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu size={18} className="text-purple-400"/> Model Thresholds</h3>
                        <button 
                            onClick={() => {
                                setAiConfig({ personThreshold: 0.75, vehicleThreshold: 0.80, faceThreshold: 0.85, weaponThreshold: 0.90 });
                                showToast("Reset to Default");
                            }}
                            className="text-xs text-primary-400 hover:text-white flex items-center gap-1"
                        >
                            <RefreshCw size={12}/> Reset Default
                        </button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Person Detection', key: 'personThreshold' }, 
                            { label: 'Vehicle Recognition', key: 'vehicleThreshold' }, 
                            { label: 'Face Matching', key: 'faceThreshold' }, 
                            { label: 'Weapon Detection', key: 'weaponThreshold' }
                        ].map((item) => (
                            <div key={item.key}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300">{item.label}</span>
                                    <span className="text-white font-mono font-bold">{(aiConfig[item.key as keyof AIConfig] * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0.1" max="1" step="0.01" 
                                    value={aiConfig[item.key as keyof AIConfig]} 
                                    onChange={(e) => setAiConfig({...aiConfig, [item.key]: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

        case 'users': return (
            <div className="space-y-6 animate-fade-in">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">User Management</h3>
                    <button 
                        onClick={() => setShowUserModal(true)}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold border border-slate-700 hover:bg-slate-700 flex items-center gap-2"
                    >
                        <Plus size={16}/> Invite User
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(u => (
                        <div key={u.id} className="glass-panel p-4 rounded-xl border border-slate-700 flex items-center gap-4 relative group">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                {u.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">{u.name}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                                <div className="text-[10px] text-primary-400 mt-0.5">{u.role}</div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <span className={`text-[9px] px-2 py-0.5 rounded ${u.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{u.status}</span>
                                <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        case 'notifications': return (
             <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-yellow-400"/> Notification Channels</h3>
                    <div className="space-y-4">
                        {[
                            { key: 'email', label: 'Email Alerts', icon: Mail }, 
                            { key: 'push', label: 'Mobile Push', icon: Smartphone }, 
                            { key: 'line', label: 'LINE Notify', icon: MessageSquare }, 
                            { key: 'desktop', label: 'Desktop Popup', icon: Monitor }
                        ].map((ch) => (
                            <div key={ch.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><ch.icon size={16}/></div>
                                    <span className="text-sm text-slate-200">{ch.label}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => showToast(`Test notification sent via ${ch.label}`)}
                                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700"
                                    >
                                        Test
                                    </button>
                                    <ToggleItem 
                                        checked={notificationSettings[ch.key as keyof typeof notificationSettings]} 
                                        onChange={(v: boolean) => setNotificationSettings({...notificationSettings, [ch.key]: v})} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        );

        case 'storage': return (
            <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><HardDrive size={18} className="text-orange-400"/> Storage Usage</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700" onClick={() => showToast("Database optimized")}>Optimize DB</button>
                            <button className="px-3 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-900/50 hover:bg-red-900/50" onClick={() => confirm("Clear temp cache?") && showToast("Cache Cleared")}>Clear Cache</button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Used: 14.2 TB</span>
                            <span>Total: 32.0 TB</span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-[45%]"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">45%</div>
                            <div className="text-xs text-slate-500">Capacity Used</div>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-green-400">90 Days</div>
                            <div className="text-xs text-slate-500">Est. Retention</div>
                        </div>
                    </div>
                </div>
            </div>
        );

        default: return null;
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy & Compliance', icon: ShieldCheck },
    { id: 'general', label: 'Global Config', icon: Globe },
    { id: 'cameras', label: 'Device Manager', icon: Server },
    { id: 'ai', label: 'AI Models', icon: Cpu },
    { id: 'notifications', label: 'Alert Center', icon: Bell },
    { id: 'users', label: 'IAM / Access', icon: Users },
    { id: 'storage', label: 'Evidence Storage', icon: Database },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in font-sans relative">
      
      {/* Toast Notification */}
      {toastMsg && (
          <div className="absolute bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 size={20} className="text-green-500" />
              <span className="text-sm font-medium">{toastMsg}</span>
          </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
             <ShieldCheck className="text-primary-400" /> System Administration
          </h1>
          <p className="text-slate-400 mt-1">Manage security policies, compliance, and device provisioning.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isSaving ? 'bg-green-600 text-white cursor-wait' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20'}`}
        >
          {isSaving ? <><Loader2 className="animate-spin" size={18} /> Committing...</> : <><Save size={18} /> Commit Policy</>}
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'}`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-primary-400' : ''} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel rounded-xl border border-slate-800 p-8 overflow-y-auto custom-scrollbar">
           {renderContent()}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Camera Modal / Mobile Pairing */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Server size={18} className="text-primary-400"/> {editingCamId ? 'Edit Device' : 'Add New Device'}
                    </h3>
                    <button onClick={() => setShowCameraModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>
                
                {isPairing ? (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[350px]">
                        
                        {/* Environment Warning Block */}
                        {(isSandbox || pairingBaseUrl.startsWith('blob:') || pairingBaseUrl.includes('localhost')) && (
                            <div className="w-full bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex gap-3 text-left animate-pulse">
                                <AlertOctagon size={24} className="text-red-500 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-400">External Connection Blocked</h4>
                                    <p className="text-xs text-red-200 mt-1">
                                        This secure preview environment prevents mobile devices from connecting. 
                                        <strong>QR Code scanning will result in a 404 error.</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Conditional QR or Disabled Message */}
                        {!isSandbox ? (
                            <div className="bg-white p-4 rounded-xl mb-4 shadow-lg">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getFullPairingUrl())}`} alt="Pairing QR" />
                            </div>
                        ) : (
                            <div className="bg-slate-800 p-8 rounded-xl mb-4 border border-slate-700 flex flex-col items-center opacity-50 grayscale select-none">
                                <QrCode size={64} className="text-slate-500 mb-2"/>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">QR Disabled in Preview</span>
                            </div>
                        )}
                        
                        <h3 className="text-white font-bold text-lg mb-2">Scan with Mobile Device</h3>
                        
                        {/* Simulator Button (Promoted) */}
                        <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
                            <a 
                                href={getFullPairingUrl()} 
                                target="_blank" 
                                rel="noreferrer"
                                className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isSandbox ? 'bg-primary-600 hover:bg-primary-500 text-white scale-105 border border-primary-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
                            >
                                <ExternalLink size={16} /> 
                                {isSandbox ? 'Open Mobile Simulator (Click Here)' : 'Open Simulator (New Tab)'}
                            </a>
                            {isSandbox && <p className="text-[10px] text-primary-400 text-center">Use this to test the mobile camera view on your computer.</p>}
                        </div>

                        <div className="flex gap-2 w-full justify-center">
                            <button onClick={() => setIsPairing(false)} className="px-4 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                                Back
                            </button>
                            <button onClick={handleSaveCamera} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 size={14} /> Complete Pairing
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={handleScanWebcams}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <Video size={14} /> Use Local Webcam
                            </button>
                            <button 
                                onClick={startMobilePairing}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary-900/30 border border-primary-500/50 rounded text-xs text-primary-300 hover:text-white hover:bg-primary-900/50 transition-colors shadow-lg"
                            >
                                <Smartphone size={14} /> Pair Mobile Camera
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Camera Name</label>
                                <input 
                                    type="text" placeholder="e.g. Front Gate Cam 01"
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                                    value={camForm.name} onChange={(e) => setCamForm({...camForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                                <input 
                                    type="text" placeholder="e.g. Zone A"
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                                    value={camForm.location} onChange={(e) => setCamForm({...camForm, location: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">IP Address</label>
                            <input 
                                type="text" placeholder="192.168.1.xxx"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white font-mono outline-none focus:border-primary-500"
                                value={camForm.ip} onChange={(e) => setCamForm({...camForm, ip: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Stream Type</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                                value={camForm.type} onChange={(e) => setCamForm({...camForm, type: e.target.value})}
                            >
                                <option value="RTSP">RTSP</option>
                                <option value="WEBRTC">WebRTC</option>
                                <option value="HLS">HLS</option>
                                <option value="ONVIF">ONVIF</option>
                                <option value="WEBCAM">Local Webcam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                {camForm.type === 'WEBCAM' ? 'Select Device' : 'Stream URL'}
                            </label>
                            {camForm.type === 'WEBCAM' && availableWebcams.length > 0 ? (
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                                    value={camForm.url} 
                                    onChange={(e) => setCamForm({...camForm, url: e.target.value, name: availableWebcams.find(d => d.deviceId === e.target.value)?.label || 'Webcam'})}
                                >
                                    {availableWebcams.map(cam => (
                                        <option key={cam.deviceId} value={cam.deviceId}>
                                            {cam.label || `Camera ${cam.deviceId.slice(0,5)}`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type="text" placeholder={camForm.type === 'WEBCAM' ? 'Scan webcams first...' : "rtsp://..."}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white font-mono outline-none focus:border-primary-500"
                                    value={camForm.url} onChange={(e) => setCamForm({...camForm, url: e.target.value})}
                                    readOnly={camForm.type === 'WEBCAM'}
                                />
                            )}
                        </div>
                    </div>
                )}
                
                {!isPairing && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
                        <button onClick={() => setShowCameraModal(false)} className="px-4 py-2 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
                        <button onClick={handleSaveCamera} disabled={!camForm.name || !camForm.url} className="px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">
                            {editingCamId ? 'Update Device' : 'Add Device'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* 2. User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-primary-400"/> Invite User
                    </h3>
                    <button onClick={() => setShowUserModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                            value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                            value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                        <select 
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-primary-500"
                            value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                        >
                            <option value="Administrator">Administrator</option>
                            <option value="Operator">Operator</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
                    <button onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
                    <button onClick={handleInviteUser} disabled={!userForm.name || !userForm.email} className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg">
                        Send Invitation
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Settings;