import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Lock, Activity, Search, AlertTriangle, 
  CheckCircle, Globe, Server, AlertOctagon, RefreshCw,
  MoreVertical, ShieldCheck, EyeOff, Wifi, ChevronRight,
  Shield, Check, X, Terminal, ArrowRight, PlayCircle, XCircle,
  WifiOff, CloudOff, Database, HardDrive, RotateCcw, CloudLightning,
  Monitor, Cpu, ArrowDownRight, Settings
} from 'lucide-react';
import { generateSecurityIncidents, getScoredCameras, generateBruteForceRunbook } from '../services/mockAiService';
import { SecurityIncident, Camera, RunbookStep, SyncStatus, BufferItem, CameraTelemetry } from '../types';

const SecurityHealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CYBER' | 'RELIABILITY'>('RELIABILITY');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filter, setFilter] = useState('ALL');
  
  // Detail State
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [runbookSteps, setRunbookSteps] = useState<RunbookStep[]>([]);
  
  // WebSocket Simulation State
  const [toast, setToast] = useState<string | null>(null);

  // --- NEW: Offline/Sync State ---
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSyncTime: new Date(),
    pendingItems: 0,
    bufferUsagePct: 0,
    uploadSpeedKBps: 0,
    status: 'IDLE'
  });
  const [bufferQueue, setBufferQueue] = useState<BufferItem[]>([]);
  
  // --- Simulation Control ---
  const [simCondition, setSimCondition] = useState<'GOOD' | 'POOR' | 'CRITICAL'>('GOOD');

  useEffect(() => {
    // Initial Load
    setIncidents(generateSecurityIncidents());
    
    // Initial Camera Load with Smart Telemetry
    updateCameras('GOOD');

    // Mock WebSocket Event listener (Security)
    const wsInterval = setInterval(() => {
       if (Math.random() > 0.95 && activeTab === 'CYBER') {
          const newIncident: SecurityIncident = {
             id: `INC-AUTO-${Date.now()}`,
             severity: 'HIGH',
             timestamp: new Date(),
             ruleId: 'BRUTE_FORCE_HTTP',
             category: 'Authentication',
             description: 'Suspicious login rate detected on Camera-004',
             sourceIp: '45.12.99.102',
             targetCameraId: 'cam-004',
             targetCameraName: 'Loading Dock (Logistics)',
             status: 'OPEN',
             runbook: generateBruteForceRunbook('INC-AUTO')
          };
          setIncidents(prev => [newIncident, ...prev]);
          setToast(`New Threat Detected: ${newIncident.ruleId}`);
          setTimeout(() => setToast(null), 4000);
       }
    }, 5000);

    return () => clearInterval(wsInterval);
  }, []);

  const updateCameras = (condition: 'GOOD' | 'POOR' | 'CRITICAL') => {
      const baseCams = getScoredCameras();
      const updated = baseCams.map(c => {
          let tel = { ...c.telemetry! };
          if (condition === 'POOR') {
              tel.jitterMs += 30;
              tel.packetLossPct += 2;
              tel.healthStatus = 'DEGRADED';
              tel.isDegradedMode = true;
              tel.resolution = '720p (Auto-Low)';
              tel.recommendations = ['High Jitter', 'Reduced FPS'];
          } else if (condition === 'CRITICAL') {
              tel.packetLossPct = 15;
              tel.reconnectCount += 5;
              tel.healthStatus = 'CRITICAL';
              tel.signalStrength = 20;
              tel.recommendations = ['Check Cable', 'Link Down'];
          }
          return { ...c, telemetry: tel };
      });
      setCameras(updated);
  };

  useEffect(() => {
      updateCameras(simCondition);
  }, [simCondition]);

  // --- AUTO-RECOVERY & OFFLINE LOGIC ---
  useEffect(() => {
    const eventGenInterval = setInterval(() => {
        if (!syncStatus.isOnline) {
            const newItem: BufferItem = {
                id: `evt-${Date.now()}`,
                timestamp: new Date(),
                eventType: Math.random() > 0.8 ? 'INTRUSION' : 'PERSON_DETECT',
                sizeKB: 250 + Math.random() * 500,
                priority: Math.random() > 0.9 ? 'HIGH' : 'NORMAL'
            };
            setBufferQueue(prev => {
                const updated = [...prev, newItem];
                if (updated.length > 50) return updated.slice(updated.length - 50);
                return updated;
            });
            setSyncStatus(prev => ({
                ...prev,
                pendingItems: prev.pendingItems + 1,
                bufferUsagePct: Math.min(100, prev.bufferUsagePct + 2)
            }));
        }
    }, 1000);
    return () => clearInterval(eventGenInterval);
  }, [syncStatus.isOnline]);

  const toggleOfflineSimulation = () => {
      if (syncStatus.isOnline) {
          setSyncStatus(prev => ({ ...prev, isOnline: false, status: 'OFFLINE', uploadSpeedKBps: 0 }));
          setToast("Network Disconnected: Switched to Local Buffer");
          setSimCondition('CRITICAL');
      } else {
          setSyncStatus(prev => ({ ...prev, isOnline: true, status: 'SYNCING' }));
          setToast("Network Restored: Auto-Sync Started");
          setSimCondition('GOOD');
          
          let itemsToSync = bufferQueue.length;
          const recoveryInterval = setInterval(() => {
              itemsToSync -= 5; 
              if (itemsToSync <= 0) {
                  clearInterval(recoveryInterval);
                  setBufferQueue([]);
                  setSyncStatus(prev => ({ ...prev, status: 'IDLE', pendingItems: 0, bufferUsagePct: 0, lastSyncTime: new Date() }));
              } else {
                  setBufferQueue(prev => prev.slice(5));
                  setSyncStatus(prev => ({ 
                      ...prev, 
                      pendingItems: itemsToSync,
                      bufferUsagePct: Math.max(0, prev.bufferUsagePct - 10),
                      uploadSpeedKBps: 1024 + Math.random() * 500
                  }));
              }
          }, 500); 
      }
  };

  const handleIncidentSelect = (incident: SecurityIncident) => {
     setSelectedIncident(incident);
     setRunbookSteps(incident.runbook || generateBruteForceRunbook(incident.id));
  };

  const handleRunbookAction = (stepId: string) => {
     setRunbookSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
     ));
  };

  const calculateOverallScore = () => {
     if (cameras.length === 0) return 0;
     const total = cameras.reduce((sum, cam) => sum + (cam.posture?.score || 0), 0);
     return Math.floor(total / cameras.length);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in relative">
      
      {/* Real-time Toast */}
      {toast && (
         <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse ${toast.includes('Network') ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.includes('Network') ? <WifiOff size={24} /> : <ShieldAlert size={24} />}
            <span className="font-bold">{toast}</span>
         </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-primary-400" />
            ศูนย์ตรวจสอบความเสถียรระบบ (System Resilience)
          </h1>
          <p className="text-slate-400 mt-1">จัดการความปลอดภัยไซเบอร์และการทำงานแบบออฟไลน์</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
            <button 
                onClick={() => setActiveTab('RELIABILITY')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'RELIABILITY' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                <Activity size={14} /> ความเสถียร & Sync
            </button>
            <button 
                onClick={() => setActiveTab('CYBER')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'CYBER' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                <Lock size={14} /> ความปลอดภัยไซเบอร์
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* TAB 1: RELIABILITY & HEALTH MONITORING */}
        {activeTab === 'RELIABILITY' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Simulator Controls (Demo Only) */}
                <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2"><Settings size={12}/> สภาพเครือข่าย:</span>
                    <div className="flex gap-2">
                        {['GOOD', 'POOR', 'CRITICAL'].map(cond => (
                            <button 
                                key={cond}
                                onClick={() => setSimCondition(cond as any)}
                                className={`px-3 py-1 text-[10px] font-bold rounded border transition-colors ${simCondition === cond ? (cond === 'GOOD' ? 'bg-green-500/20 text-green-400 border-green-500' : cond === 'POOR' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-red-500/20 text-red-400 border-red-500') : 'bg-slate-800 text-slate-500 border-transparent hover:bg-slate-700'}`}
                            >
                                {cond}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    <button 
                        onClick={toggleOfflineSimulation}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-2 border transition-all ${!syncStatus.isOnline ? 'bg-red-500 text-white border-red-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
                    >
                        {syncStatus.isOnline ? <WifiOff size={12}/> : <RefreshCw size={12} className="animate-spin"/>}
                        {syncStatus.isOnline ? 'จำลองเน็ตหลุด' : 'เชื่อมต่อใหม่'}
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="glass-panel p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">System Uptime</div>
                        <div className="text-2xl font-bold text-white font-mono">99.98%</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10}/> ทุกระบบทำงานปกติ</div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Active Bandwidth</div>
                        <div className="text-2xl font-bold text-white font-mono">48.2 MB/s</div>
                        <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[40%]"></div>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Avg AI Latency</div>
                        <div className="text-2xl font-bold text-white font-mono">142ms</div>
                        <div className="text-[10px] text-slate-400 mt-1">Inference + Network</div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Edge Storage</div>
                        <div className="text-2xl font-bold text-white font-mono">
                            {syncStatus.bufferUsagePct}% 
                            <span className="text-xs font-sans font-normal text-slate-400 ml-1">Used</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${syncStatus.bufferUsagePct > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${syncStatus.bufferUsagePct}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Smart Health Monitor */}
                <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Monitor size={18} className="text-primary-400"/> สถานะสุขภาพกล้อง
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-green-500"></div> Healthy</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Degraded</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {cameras.map(cam => (
                            <div key={cam.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${cam.telemetry?.healthStatus === 'HEALTHY' ? 'bg-green-500/10 text-green-500' : cam.telemetry?.healthStatus === 'DEGRADED' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <Server size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{cam.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{cam.ipAddress} • Uptime: {Math.floor((cam.telemetry?.uptimeSeconds || 0)/3600)}h</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold px-2 py-1 rounded border inline-flex items-center gap-1 ${
                                            cam.telemetry?.healthStatus === 'HEALTHY' ? 'bg-green-900/20 text-green-400 border-green-900' : 
                                            cam.telemetry?.healthStatus === 'DEGRADED' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900' : 
                                            'bg-red-900/20 text-red-400 border-red-900'
                                        }`}>
                                            {cam.telemetry?.healthStatus}
                                        </div>
                                        {cam.telemetry?.isDegradedMode && (
                                            <div className="text-[10px] text-orange-400 mt-1 flex items-center justify-end gap-1">
                                                <ArrowDownRight size={10} /> Auto-Low Res
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metrics Row */}
                                <div className="grid grid-cols-5 gap-4 py-2 border-t border-slate-800/50">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">FPS</div>
                                        <div className={`text-sm font-mono font-bold ${cam.telemetry?.fps! < 20 ? 'text-yellow-500' : 'text-slate-200'}`}>
                                            {cam.telemetry?.fps.toFixed(1)} / {cam.telemetry?.targetFps}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Jitter</div>
                                        <div className={`text-sm font-mono font-bold ${cam.telemetry?.jitterMs! > 30 ? 'text-red-400' : 'text-slate-200'}`}>
                                            {Math.floor(cam.telemetry?.jitterMs || 0)} ms
                                        </div>
                                        {/* Sparkline Mock */}
                                        <div className="w-12 h-1 bg-slate-800 mt-1 rounded overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{width: `${Math.min(100, (cam.telemetry?.jitterMs||0))}%`}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Packet Loss</div>
                                        <div className={`text-sm font-mono font-bold ${cam.telemetry?.packetLossPct! > 2 ? 'text-red-400' : 'text-green-400'}`}>
                                            {cam.telemetry?.packetLossPct.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Bitrate</div>
                                        <div className="text-sm font-mono font-bold text-slate-200">
                                            {(cam.telemetry?.bitrateKbps || 0) / 1000} Mbps
                                        </div>
                                        <div className="text-[10px] text-slate-500">{cam.telemetry?.resolution}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Reconnects</div>
                                        <div className={`text-sm font-mono font-bold ${cam.telemetry?.reconnectCount! > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                            {cam.telemetry?.reconnectCount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* TAB 2: CYBER SECURITY */}
        {activeTab === 'CYBER' && (
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Left: Incident List */}
                <div className="w-96 flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <ShieldAlert size={16} className="text-red-400"/> Active Threats
                            </h3>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] text-red-400 font-bold">{incidents.filter(i => i.status === 'OPEN').length} OPEN</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                            {['ALL', 'CRITICAL', 'HIGH'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded border ${filter === f ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {incidents.filter(i => filter === 'ALL' || i.severity === filter).map(inc => (
                            <div 
                                key={inc.id} 
                                onClick={() => handleIncidentSelect(inc)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden group ${selectedIncident?.id === inc.id ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-slate-200">{inc.ruleId}</span>
                                        <span className="text-[10px] text-slate-500">{inc.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 line-clamp-2">{inc.description}</div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500 border border-slate-800">{inc.sourceIp}</span>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Incident Response (Runbook) */}
                <div className="flex-1 flex flex-col gap-4">
                    {selectedIncident ? (
                        <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-800 bg-red-950/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase">Critical Incident</span>
                                            <span className="text-xs text-red-300 font-mono">{selectedIncident.id}</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-white">{selectedIncident.category}: {selectedIncident.ruleId}</h2>
                                    </div>
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded border border-slate-700">
                                        Export Log
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <span className="text-slate-500 block mb-1">Source IP</span>
                                        <span className="text-white font-mono">{selectedIncident.sourceIp}</span>
                                    </div>
                                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <span className="text-slate-500 block mb-1">Target Device</span>
                                        <span className="text-white">{selectedIncident.targetCameraName}</span>
                                    </div>
                                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <span className="text-slate-500 block mb-1">Status</span>
                                        <span className="text-yellow-400 font-bold">{selectedIncident.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Terminal size={16} className="text-primary-400"/> Interactive Runbook
                                </h3>
                                
                                <div className="space-y-4">
                                    {runbookSteps.map((step, index) => (
                                        <div key={step.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${step.isCompleted ? 'bg-green-900/10 border-green-900/30 opacity-70' : 'bg-slate-800/40 border-slate-700'}`}>
                                            <div className="flex-shrink-0 mt-1">
                                                <button 
                                                    onClick={() => handleRunbookAction(step.id)}
                                                    className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${step.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500 text-transparent hover:border-slate-400'}`}
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold text-sm ${step.isCompleted ? 'text-green-400 line-through' : 'text-slate-200'}`}>{step.label}</h4>
                                                    <span className="text-[10px] text-slate-500 font-mono">Step {index + 1}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 mb-3">{step.description}</p>
                                                
                                                {!step.isCompleted && step.actionType === 'BUTTON' && (
                                                    <button 
                                                        onClick={() => handleRunbookAction(step.id)}
                                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded shadow-lg shadow-primary-900/20 flex items-center gap-2"
                                                    >
                                                        {step.actionLabel || 'Execute Action'} <ArrowRight size={12} />
                                                    </button>
                                                )}
                                                {!step.isCompleted && step.actionType === 'CHECKBOX' && (
                                                    <div className="text-[10px] text-slate-500 italic">Check the box to confirm manual verification.</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 glass-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/50">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800 shadow-inner">
                                <ShieldCheck size={40} className="opacity-30" />
                            </div>
                            <h3 className="text-white font-bold mb-1 text-lg">Cyber Defense Center</h3>
                            <p className="text-sm max-w-xs mx-auto">Select a threat from the active list to initiate response protocols and automated runbooks.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SecurityHealth;