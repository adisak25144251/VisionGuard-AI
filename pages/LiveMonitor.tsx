
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CAMERAS } from '../constants';
import AiOverlay from '../components/AiOverlay';
import PrivacyMaskLayer from '../components/PrivacyMaskLayer';
import { 
  Maximize2, Settings, Shield, Activity, Grid, Square, 
  Plus, Trash2, Video, Smartphone, Wifi, Lock, Fingerprint, 
  EyeOff, RefreshCw, X, QrCode, Eye, KeyRound, CheckCircle
} from 'lucide-react';
import { Camera, CameraStatus, UserRole } from '../types';
import Peer from 'peerjs';

// --- Helper: Local Webcam Stream ---
const WebcamFeed: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startStream = async () => {
      try {
        const constraints: MediaStreamConstraints = {
           video: deviceId === 'default' ? true : { deviceId: { exact: deviceId } },
           audio: false
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch (err: any) {
        console.error("Failed to access webcam:", err);
        setError(err.message || 'Camera Access Denied');
      }
    };
    startStream();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [deviceId]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-4 text-center">
        <Video size={32} className="mb-2 text-red-500" />
        <span className="text-xs font-bold text-red-400">การเชื่อมต่อล้มเหลว</span>
        <span className="text-[10px] mt-1">{error}</span>
      </div>
    );
  }
  return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
};

// --- Helper: PeerJS Remote Stream ---
const PeerStream: React.FC<{ peerId: string }> = ({ peerId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTING');

  useEffect(() => {
    const p = new Peer();
    
    p.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      const conn = p.connect(peerId);
      
      conn.on('open', () => {
         console.log('Connected to: ' + peerId);
      });

      try {
        const getUserMedia = (navigator.mediaDevices as any).getUserMedia || 
                             (navigator.mediaDevices as any).webkitGetUserMedia || 
                             (navigator.mediaDevices as any).mozGetUserMedia;
                             
        getUserMedia({ video: false, audio: true }, (stream: MediaStream) => { 
            const call = p.call(peerId, stream);
            call.on('stream', (remoteStream) => {
                setStatus('CONNECTED');
                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                }
            });
            call.on('close', () => setStatus('DISCONNECTED'));
            call.on('error', () => setStatus('ERROR'));
        }, (err: any) => {
            console.error('Failed to get local stream', err);
        });

      } catch (e) {
          console.error(e);
          setStatus('ERROR');
      }
    });

    p.on('error', (err) => {
       console.error('Peer error:', err);
       setStatus('ERROR');
    });

    return () => p.destroy();
  }, [peerId]);

  return (
     <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
        {status !== 'CONNECTED' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-900/80 backdrop-blur-sm">
              {status === 'CONNECTING' && <Wifi size={24} className="animate-pulse mb-2 text-primary-400" />}
              {status === 'ERROR' && <Video size={24} className="mb-2 text-red-500" />}
              <span className="text-xs font-mono uppercase">{status}</span>
              <span className="text-[10px] text-slate-400 mt-1">Target ID: {peerId}</span>
           </div>
        )}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
     </div>
  );
};

// --- Smart Overlay Component ---
const SmartOverlay: React.FC<{ camera: Camera }> = ({ camera }) => {
  const [hash, setHash] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHash(Math.random().toString(36).substring(2, 15).toUpperCase());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
       {/* Top Status Bar */}
       <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
             <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <span className={`w-2 h-2 rounded-full ${camera.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-white font-bold text-xs shadow-black drop-shadow-md">{camera.name}</span>
             </div>
             <div className="flex gap-1">
                {camera.security?.encryption !== 'NONE' && (
                   <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur rounded border border-green-500/30 text-[9px] text-green-400 flex items-center gap-1 font-mono">
                      <Lock size={8} /> AES-256
                   </span>
                )}
             </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                ● สด
             </div>
             {camera.forensics?.rollingHash && (
                <div className="text-[8px] text-white/50 font-mono bg-black/40 px-1 rounded">
                   HASH: {hash}
                </div>
             )}
          </div>
       </div>

       {/* Privacy Masks (Static) */}
       {camera.privacyMasks?.map((mask, i) => (
          <div 
            key={i} 
            className="absolute bg-black/95 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"
            style={{
               left: `${mask.points[0].x}%`, 
               top: `${mask.points[0].y}%`, 
               width: `${mask.points[2].x - mask.points[0].x}%`,
               height: `${mask.points[2].y - mask.points[0].y}%`
            }}
          >
             <div className="text-slate-500 text-[10px] flex flex-col items-center">
                <EyeOff size={16} className="mb-1" />
                <span className="tracking-wider font-bold">ปิดบัง</span>
             </div>
          </div>
       ))}

       {/* Bottom Info */}
       <div className="flex justify-between items-end">
          <div className="flex gap-1 opacity-80">
             {camera.forensics?.watermarkEnabled && (
                <div className="text-[10px] text-white/30 font-mono tracking-[0.2em] uppercase mix-blend-overlay">
                   {camera.forensics.watermarkText}
                </div>
             )}
          </div>
          
          <div className="flex gap-1">
             {camera.features.map(f => (
               <span key={f} className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border border-cyan-500/20 bg-cyan-900/40 text-cyan-200 backdrop-blur-sm">
                 {f}
               </span>
             ))}
          </div>
       </div>
    </div>
  );
};

const LiveMonitor: React.FC = () => {
  const [layout, setLayout] = useState<1 | 2 | 4 | 9>(4);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLanes, setShowLanes] = useState(false);
  const [showFence, setShowFence] = useState(false);
  
  // Privacy & RBAC State
  const [userRole, setUserRole] = useState<UserRole>('VIEWER'); // Default restricted
  const [unmaskedCameras, setUnmaskedCameras] = useState<string[]>([]);
  const [unmaskReason, setUnmaskReason] = useState('');
  const [targetUnmaskId, setTargetUnmaskId] = useState<string | null>(null);
  
  // Camera State
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('visionguard_cameras');
    if (saved) {
      try {
        setCameras(JSON.parse(saved));
      } catch (e) {
        setCameras(MOCK_CAMERAS);
      }
    } else {
      setCameras(MOCK_CAMERAS);
    }
  }, []);

  const handleUnmaskRequest = (camId: string) => {
    if (userRole === 'VIEWER') {
        alert('การเข้าถึงถูกปฏิเสธ: บทบาท Viewer ไม่สามารถเปิดดูโซนส่วนตัวได้');
        return;
    }
    setTargetUnmaskId(camId);
  };

  const confirmUnmask = () => {
    if (targetUnmaskId && unmaskReason.trim().length > 3) {
        setUnmaskedCameras([...unmaskedCameras, targetUnmaskId]);
        setTargetUnmaskId(null);
        setUnmaskReason('');
        // Log auditing would happen here
        console.log(`AUDIT: User ${userRole} unmasked ${targetUnmaskId} reason: ${unmaskReason}`);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col relative animate-fade-in font-sans">
      
      {/* Unmask Auth Modal */}
      {targetUnmaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-4 text-white">
                 <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500"><KeyRound size={24}/></div>
                 <h3 className="font-bold text-lg">ขอเปิดดูโซนส่วนตัว</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                 คำเตือน: การกระทำนี้จะถูกบันทึกลงในระบบ Audit Log ถาวร
              </p>
              
              <div className="space-y-3">
                 <div>
                    <label className="text-xs text-slate-300 font-bold mb-1 block">เหตุผลในการเข้าถึง</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-primary-500 outline-none"
                        rows={3}
                        placeholder="เช่น ตรวจสอบเหตุการณ์ Case #402..."
                        value={unmaskReason}
                        onChange={(e) => setUnmaskReason(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setTargetUnmaskId(null)} className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">ยกเลิก</button>
                    <button 
                        onClick={confirmUnmask}
                        disabled={unmaskReason.length < 4}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded font-bold text-xs flex items-center gap-2"
                    >
                        <Eye size={14} /> เปิดดู
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap justify-between items-center bg-slate-900/80 backdrop-blur p-2 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex space-x-1 items-center">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 mr-3">
             <button onClick={() => setUserRole('VIEWER')} className={`text-xs px-2 py-1 rounded ${userRole === 'VIEWER' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>ผู้ชม</button>
             <button onClick={() => setUserRole('OPERATOR')} className={`text-xs px-2 py-1 rounded ${userRole === 'OPERATOR' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>เจ้าหน้าที่</button>
             <button onClick={() => setUserRole('ADMIN')} className={`text-xs px-2 py-1 rounded ${userRole === 'ADMIN' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>แอดมิน</button>
          </div>

          {[1, 2, 4, 9].map((id) => (
             <button 
               key={id}
               onClick={() => setLayout(id as any)} 
               className={`p-2 rounded-lg transition-all ${layout === id ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
             >
               <Grid size={18} />
             </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${showOverlay ? 'bg-primary-600/20 text-primary-400 border-primary-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
          >
            <Activity size={16} className="mr-2" />
            ข้อมูลซ้อนทับ (Overlay)
          </button>
        </div>
      </div>

      {/* Grid */}
      <div 
        className="grid gap-4 flex-1 overflow-y-auto custom-scrollbar p-1"
        style={{ 
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(layout))}, minmax(0, 1fr))`,
          gridAutoRows: 'minmax(0, 1fr)'
        }}
      >
        {cameras.slice(0, layout).map((cam) => (
          <div key={cam.id} className="relative bg-black rounded-xl overflow-hidden group border border-slate-800 shadow-2xl">
            
            {/* Video Feed */}
            <div className="relative w-full h-full bg-slate-950">
                {cam.streamType === 'WEBRTC' ? (
                    <PeerStream peerId={cam.url} />
                ) : cam.streamType === 'WEBCAM' ? (
                    <WebcamFeed deviceId={cam.url} />
                ) : (
                    <img 
                        src={cam.url} 
                        alt={cam.name} 
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1e293b/FFF?text=No+Signal'; }}
                    />
                )}
                
                {/* Privacy Layer */}
                {!unmaskedCameras.includes(cam.id) && (
                    <PrivacyMaskLayer active={true} type="BOTH" userRole={userRole} />
                )}

                {/* Overlays */}
                {showOverlay && <SmartOverlay camera={cam} />}
                <AiOverlay active={showOverlay} showLanes={showLanes} showFence={showFence} />
            </div>

            {/* Unmask Button (Only if not already unmasked) */}
            {!unmaskedCameras.includes(cam.id) && userRole !== 'VIEWER' && (
                <button 
                    onClick={() => handleUnmaskRequest(cam.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded hover:bg-primary-600 transition-colors z-30 opacity-0 group-hover:opacity-100" 
                    title="เปิดดูวิดีโอ"
                >
                    <EyeOff size={16} />
                </button>
            )}
            
            {/* Re-Mask Button */}
            {unmaskedCameras.includes(cam.id) && (
                <button 
                    onClick={() => setUnmaskedCameras(unmaskedCameras.filter(id => id !== cam.id))}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded hover:bg-red-500 transition-colors z-30" 
                    title="เปิดโหมดปิดบัง"
                >
                    <Eye size={16} />
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMonitor;
