import React, { useEffect, useMemo, useRef, useState } from 'react';
import AiOverlay from '../components/AiOverlay';
import PrivacyMaskLayer from '../components/PrivacyMaskLayer';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Grid,
  KeyRound,
  Lock,
  Maximize2,
  Play,
  Radar,
  Shield,
  ShieldCheck,
  Smartphone,
  Video,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Camera, UserRole } from '../types';
import Peer from 'peerjs';
import {
  VisionAnalysis,
  VisionEvent,
  analyzeVideoFrame,
  createLocalWebcamCamera,
  loadStoredCameras,
  saveStoredCameras
} from '../services/edgeVision';

const emptyDeviceId = 'default';

const StreamUnavailable: React.FC<{ camera: Camera }> = ({ camera }) => (
  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
      <WifiOff size={26} className="text-slate-500" />
    </div>
    <h3 className="text-sm font-bold text-slate-200">ต้องใช้ Media Gateway จริง</h3>
    <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
      {camera.streamType} ไม่สามารถเปิดตรงจาก browser/Vercel ได้อย่างปลอดภัย โปรดเชื่อมต่อ WebRTC relay หรือ HLS gateway
      ที่ส่งเฟรมจริงมายังเว็บก่อน ระบบจะไม่แสดงภาพจำลองแทนสัญญาณจริง
    </p>
    <div className="mt-4 text-[10px] font-mono text-slate-600 break-all">{camera.url || 'NO_STREAM_URL'}</div>
  </div>
);

const WebcamFeed: React.FC<{
  camera: Camera;
  onAnalysis: (analysis: VisionAnalysis) => void;
}> = ({ camera, onAnalysis }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onAnalysisRef = useRef(onAnalysis);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onAnalysisRef.current = onAnalysis;
  }, [onAnalysis]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    let lastAnalysis = 0;

    const loop = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const now = performance.now();

      if (video && canvas && video.readyState >= 2 && now - lastAnalysis > 180) {
        const analysis = analyzeVideoFrame(camera, video, canvas);
        if (analysis) {
          lastAnalysis = now;
          onAnalysisRef.current(analysis);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Browser does not support camera access');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: camera.url && camera.url !== emptyDeviceId ? { deviceId: { exact: camera.url } } : true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setReady(true);
        setError(null);
        loop();
      } catch (err: any) {
        setReady(false);
        setError(err?.message || 'Camera permission denied');
      }
    };

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [camera]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-6">
        <Video size={34} className="mb-3 text-red-500" />
        <span className="text-sm font-bold text-red-300">ไม่สามารถเปิดกล้องจริงได้</span>
        <span className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">{error}</span>
        <span className="text-[10px] text-slate-600 mt-4">บนมือถือ/Vercel ต้องเปิดผ่าน HTTPS และอนุญาตสิทธิ์กล้อง</span>
      </div>
    );
  }

  return (
    <>
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">OPENING REAL CAMERA</span>
          </div>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

const PeerStream: React.FC<{ camera: Camera }> = ({ camera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTING');

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', () => {
      const call = peer.call(camera.url, new MediaStream());
      call.on('stream', remoteStream => {
        setStatus('CONNECTED');
        if (videoRef.current) videoRef.current.srcObject = remoteStream;
      });
      call.on('close', () => setStatus('DISCONNECTED'));
      call.on('error', () => setStatus('ERROR'));
    });

    peer.on('error', () => setStatus('ERROR'));

    return () => peer.destroy();
  }, [camera.url]);

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
      {status !== 'CONNECTED' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-950/90">
          {status === 'CONNECTING' ? <Wifi size={24} className="animate-pulse mb-2 text-cyan-400" /> : <WifiOff size={24} className="mb-2 text-red-500" />}
          <span className="text-xs font-mono uppercase">{status}</span>
          <span className="text-[10px] text-slate-500 mt-1">Mobile peer: {camera.url}</span>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
    </div>
  );
};

const SmartOverlay: React.FC<{ camera: Camera; analysis?: VisionAnalysis }> = ({ camera, analysis }) => {
  const metrics = analysis?.metrics;
  const tamper = metrics?.tamperStatus || 'NO_FRAME';
  const isHealthy = tamper === 'NORMAL';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-30">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg max-w-[70vw]">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-white font-bold text-xs truncate">{camera.name}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 bg-black/60 rounded border border-emerald-500/30 text-[9px] text-emerald-300 flex items-center gap-1 font-mono">
              <Lock size={8} /> USER MEDIA
            </span>
            <span className="px-1.5 py-0.5 bg-black/60 rounded border border-cyan-500/30 text-[9px] text-cyan-200 flex items-center gap-1 font-mono">
              <Radar size={8} /> EDGE
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">LIVE</div>
          {metrics && (
            <div className="text-[8px] text-white/60 font-mono bg-black/45 px-1.5 py-0.5 rounded">
              HASH {metrics.frameHash.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end gap-3">
        <div className="hidden sm:flex flex-col gap-1 text-[10px] text-white/70 font-mono bg-black/35 border border-white/10 rounded-lg px-2 py-1">
          <span>{metrics?.resolution || 'waiting for frame'}</span>
          <span>{metrics ? `${metrics.fps} FPS | motion ${(metrics.motionRatio * 100).toFixed(1)}%` : 'edge analytics pending'}</span>
        </div>

        <div className="flex flex-wrap justify-end gap-1">
          {camera.features.map(feature => (
            <span key={feature} className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border border-cyan-500/20 bg-cyan-950/60 text-cyan-100 backdrop-blur-sm">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; tone?: 'green' | 'amber' | 'cyan' | 'red' }> = ({ label, value, tone = 'cyan' }) => {
  const toneClass = {
    green: 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10',
    amber: 'text-amber-300 border-amber-500/25 bg-amber-500/10',
    cyan: 'text-cyan-200 border-cyan-500/25 bg-cyan-500/10',
    red: 'text-red-300 border-red-500/25 bg-red-500/10'
  }[tone];

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
};

const EmptyState: React.FC<{ onStartLocal: () => void }> = ({ onStartLocal }) => (
  <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 text-center shadow-2xl">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-5">
        <Video size={32} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white">เริ่มใช้งาน VisionGuard ด้วยกล้องจริง</h1>
      <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
        ระบบจะไม่สร้างข้อมูลจำลองให้ดูเหมือนมีเหตุการณ์จริง กดเริ่มเพื่อเปิด webcam ของอุปกรณ์นี้ แล้ววิเคราะห์ motion,
        tamper และคุณภาพภาพจากเฟรมจริงบนเครื่องทันที
      </p>
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onStartLocal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-300 transition-colors"
        >
          <Play size={18} /> เปิดกล้องอุปกรณ์นี้
        </button>
        <a
          href="#/settings"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-100 font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <Smartphone size={18} /> จับคู่มือถือ / เพิ่มกล้อง
        </a>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <MetricCard label="Vercel mobile" value="HTTPS ready" tone="green" />
        <MetricCard label="Data policy" value="No simulation" tone="amber" />
        <MetricCard label="Inference" value="Local frame analysis" tone="cyan" />
      </div>
    </div>
  </div>
);

const LiveMonitor: React.FC = () => {
  const [layout, setLayout] = useState<1 | 2 | 4 | 9>(4);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLanes, setShowLanes] = useState(false);
  const [showFence, setShowFence] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('VIEWER');
  const [unmaskedCameras, setUnmaskedCameras] = useState<string[]>([]);
  const [unmaskReason, setUnmaskReason] = useState('');
  const [targetUnmaskId, setTargetUnmaskId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, VisionAnalysis>>({});
  const [events, setEvents] = useState<VisionEvent[]>([]);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    setCameras(loadStoredCameras());
  }, []);

  const handleAnalysis = (camera: Camera, analysis: VisionAnalysis) => {
    setAnalyses(prev => ({ ...prev, [camera.id]: analysis }));
    if (analysis.event) {
      setEvents(prev => [analysis.event!, ...prev].slice(0, 25));
      const stored = localStorage.getItem('visionguard_live_events');
      const parsed = stored ? JSON.parse(stored) : [];
      localStorage.setItem('visionguard_live_events', JSON.stringify([analysis.event, ...parsed].slice(0, 100)));
    }
  };

  const startLocalWebcam = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser does not support getUserMedia');
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const firstTrack = permissionStream.getVideoTracks()[0];
      const selected = videoInputs[0];
      const camera = createLocalWebcamCamera(selected?.deviceId || emptyDeviceId, selected?.label || firstTrack?.label || 'Local Webcam');
      permissionStream.getTracks().forEach(track => track.stop());

      const next = cameras.some(existing => existing.id === camera.id)
        ? cameras
        : [...cameras, camera];

      setCameras(next);
      saveStoredCameras(next);
      setStartError(null);
    } catch (err: any) {
      setStartError(err?.message || 'Camera permission denied');
    }
  };

  const confirmUnmask = () => {
    if (!targetUnmaskId || unmaskReason.trim().length < 4) return;
    setUnmaskedCameras(prev => [...new Set([...prev, targetUnmaskId])]);
    setTargetUnmaskId(null);
    setUnmaskReason('');
  };

  const visibleCameras = useMemo(() => cameras.slice(0, layout), [cameras, layout]);
  const selectedAnalysis = visibleCameras[0] ? analyses[visibleCameras[0].id] : undefined;

  if (cameras.length === 0) {
    return (
      <>
        <EmptyState onStartLocal={startLocalWebcam} />
        {startError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-red-500/30 bg-red-950 px-4 py-3 text-sm text-red-100 shadow-2xl">
            {startError}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in font-sans">
      {targetUnmaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400"><KeyRound size={24} /></div>
              <h3 className="font-bold text-lg">ขอเปิดดูภาพไม่ปิดบัง</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">ต้องระบุเหตุผลก่อนเปิด masking เพื่อให้ audit trail ตรวจสอบได้</p>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
              rows={3}
              placeholder="เช่น ตรวจสอบเหตุการณ์ใน case จริง..."
              value={unmaskReason}
              onChange={event => setUnmaskReason(event.target.value)}
            />
            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setTargetUnmaskId(null)} className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">ยกเลิก</button>
              <button
                onClick={confirmUnmask}
                disabled={unmaskReason.trim().length < 4}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-2"
              >
                <Eye size={14} /> เปิดดู
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 min-h-0">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur p-3 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                {(['VIEWER', 'OPERATOR', 'ADMIN'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={`text-xs px-2.5 py-1.5 rounded-md ${userRole === role ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                {[1, 2, 4, 9].map(id => (
                  <button
                    key={id}
                    onClick={() => setLayout(id as 1 | 2 | 4 | 9)}
                    className={`p-2 rounded-md ${layout === id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                    title={`${id} camera layout`}
                  >
                    <Grid size={16} />
                  </button>
                ))}
              </div>

              <button onClick={startLocalWebcam} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-2">
                <Video size={15} /> เพิ่ม webcam จริง
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${showOverlay ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                <Activity size={15} /> Overlay
              </button>
              <button
                onClick={() => setShowLanes(!showLanes)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border ${showLanes ? 'bg-yellow-500/15 text-yellow-200 border-yellow-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                Lanes
              </button>
              <button
                onClick={() => setShowFence(!showFence)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border ${showFence ? 'bg-red-500/15 text-red-200 border-red-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
              >
                Fence
              </button>
            </div>
          </div>

          <div
            className="grid gap-4 min-h-[60vh]"
            style={{
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(layout))}, minmax(0, 1fr))`,
              gridAutoRows: 'minmax(280px, 1fr)'
            }}
          >
            {visibleCameras.map(camera => {
              const analysis = analyses[camera.id];
              const isUnmasked = unmaskedCameras.includes(camera.id);

              return (
                <div key={camera.id} className="relative bg-black rounded-xl overflow-hidden group border border-slate-800 shadow-2xl min-h-[280px]">
                  <div className="absolute top-2 left-2 z-40 flex gap-1">
                    <span className="px-2 py-1 bg-black/60 text-[10px] text-slate-300 border border-white/10 rounded-md font-mono">
                      {camera.streamType}
                    </span>
                  </div>

                  {camera.streamType === 'WEBCAM' ? (
                    <WebcamFeed camera={camera} onAnalysis={analysis => handleAnalysis(camera, analysis)} />
                  ) : camera.streamType === 'WEBRTC' ? (
                    <PeerStream camera={camera} />
                  ) : (
                    <StreamUnavailable camera={camera} />
                  )}

                  {!isUnmasked && (
                    <PrivacyMaskLayer active={true} type="BOTH" userRole={userRole} boxes={analysis?.boxes || []} />
                  )}

                  {showOverlay && <SmartOverlay camera={camera} analysis={analysis} />}
                  <AiOverlay active={showOverlay} showLanes={showLanes} showFence={showFence} boxes={analysis?.boxes || []} />

                  {!isUnmasked && userRole !== 'VIEWER' && (
                    <button
                      onClick={() => setTargetUnmaskId(camera.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-cyan-500 hover:text-slate-950 transition-colors z-40 opacity-0 group-hover:opacity-100"
                      title="เปิด masking"
                    >
                      <EyeOff size={16} />
                    </button>
                  )}

                  {isUnmasked && (
                    <button
                      onClick={() => setUnmaskedCameras(prev => prev.filter(id => id !== camera.id))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors z-40"
                      title="กลับสู่โหมดปิดบัง"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 min-w-0">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-300" /> Real Edge Status
              </h2>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                NO MOCK DATA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="FPS" value={selectedAnalysis?.metrics.fps ? `${selectedAnalysis.metrics.fps}` : '--'} tone="green" />
              <MetricCard label="Motion" value={selectedAnalysis ? `${(selectedAnalysis.metrics.motionRatio * 100).toFixed(1)}%` : '--'} tone="cyan" />
              <MetricCard label="Brightness" value={selectedAnalysis ? `${selectedAnalysis.metrics.brightness}` : '--'} tone="cyan" />
              <MetricCard
                label="Tamper"
                value={selectedAnalysis?.metrics.tamperStatus || 'WAITING'}
                tone={selectedAnalysis?.metrics.tamperStatus === 'NORMAL' ? 'green' : 'amber'}
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
                <Fingerprint size={14} className="text-cyan-300" /> Frame Integrity
              </div>
              <div className="font-mono break-all text-slate-500">
                {selectedAnalysis ? selectedAnalysis.metrics.frameHash.toUpperCase() : 'Waiting for first camera frame'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <AlertTriangle size={17} className="text-amber-300" /> Live Events
            </h2>
            <div className="space-y-2 max-h-[44vh] overflow-y-auto custom-scrollbar pr-1">
              {events.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                  ยังไม่มี event จากเฟรมจริง
                </div>
              ) : events.map(event => (
                <div key={event.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${event.type === 'TAMPER' ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-cyan-200 bg-cyan-500/10 border-cyan-500/20'}`}>
                      {event.type}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">{event.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{event.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{event.cameraName} | {(event.confidence * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-white">{cameras.length}</div>
                <div className="text-[10px] text-slate-500 uppercase">Cameras</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{Object.keys(analyses).length}</div>
                <div className="text-[10px] text-slate-500 uppercase">Live feeds</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{events.length}</div>
                <div className="text-[10px] text-slate-500 uppercase">Events</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-400" /> Local webcam uses real browser frames only</span>
        <span className="flex items-center gap-2"><Shield size={12} className="text-cyan-300" /> Vercel/mobile requires HTTPS camera permission</span>
        <span className="flex items-center gap-2"><Maximize2 size={12} /> Responsive command center</span>
      </div>
    </div>
  );
};

export default LiveMonitor;
