import React, { useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, FileVideo, RefreshCw, Scan, Upload, Video, WifiOff } from 'lucide-react';
import { VisionAnalysis, VisionEvent, analyzeVideoFrame, createLocalWebcamCamera } from '../services/edgeVision';

interface VideoSummary {
  samples: number;
  motionFrames: number;
  avgBrightness: number;
  avgSharpness: number;
  avgMotion: number;
  duration: number;
}

const waitForSeek = (video: HTMLVideoElement, time: number) => new Promise<void>((resolve, reject) => {
  const timeout = window.setTimeout(() => {
    cleanup();
    reject(new Error('Video seek timed out'));
  }, 5000);

  const cleanup = () => {
    window.clearTimeout(timeout);
    video.removeEventListener('seeked', handleSeeked);
    video.removeEventListener('error', handleError);
  };

  const handleSeeked = () => {
    cleanup();
    resolve();
  };

  const handleError = () => {
    cleanup();
    reject(new Error('Could not read video frame'));
  };

  video.addEventListener('seeked', handleSeeked, { once: true });
  video.addEventListener('error', handleError, { once: true });
  video.currentTime = time;
});

const VideoAnalytics: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyses, setAnalyses] = useState<VisionAnalysis[]>([]);
  const [events, setEvents] = useState<VisionEvent[]>([]);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const operationId = useMemo(() => {
    if (!file) return '';
    return `${file.name}-${file.size}-${file.lastModified}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18).toUpperCase();
  }, [file]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(selected);
    setVideoUrl(URL.createObjectURL(selected));
    setAnalyses([]);
    setEvents([]);
    setSummary(null);
    setProgress(0);
    setError(null);
  };

  const analyzeVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!file || !video || !canvas) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setAnalyses([]);
    setEvents([]);
    setSummary(null);

    try {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error('วิดีโอนี้ยังโหลด metadata ไม่ครบหรืออ่าน duration ไม่ได้');
      }

      video.pause();
      const camera = createLocalWebcamCamera(`upload-${operationId}`, file.name);
      const sampleCount = Math.min(48, Math.max(8, Math.ceil(video.duration / 2)));
      const nextAnalyses: VisionAnalysis[] = [];
      const nextEvents: VisionEvent[] = [];

      for (let i = 0; i < sampleCount; i += 1) {
        const time = sampleCount === 1 ? 0 : (video.duration * i) / (sampleCount - 1);
        await waitForSeek(video, Math.min(time, Math.max(0, video.duration - 0.05)));
        const analysis = analyzeVideoFrame(camera, video, canvas);
        if (analysis) {
          nextAnalyses.push(analysis);
          if (analysis.event) nextEvents.push(analysis.event);
        }
        setProgress(Math.round(((i + 1) / sampleCount) * 100));
      }

      const samples = nextAnalyses.length || 1;
      const motionFrames = nextAnalyses.filter(item => item.metrics.motionRatio > 0.015).length;
      const avgBrightness = nextAnalyses.reduce((sum, item) => sum + item.metrics.brightness, 0) / samples;
      const avgSharpness = nextAnalyses.reduce((sum, item) => sum + item.metrics.sharpness, 0) / samples;
      const avgMotion = nextAnalyses.reduce((sum, item) => sum + item.metrics.motionRatio, 0) / samples;

      setAnalyses(nextAnalyses);
      setEvents(nextEvents);
      setSummary({
        samples: nextAnalyses.length,
        motionFrames,
        avgBrightness,
        avgSharpness,
        avgMotion,
        duration: video.duration
      });
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถวิเคราะห์วิดีโอได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl(null);
    setAnalyses([]);
    setEvents([]);
    setSummary(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in gap-4">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="text-cyan-300" size={24} />
            <h1 className="text-2xl font-bold text-white tracking-tight">วิเคราะห์วิดีโอจริง</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 ml-8 font-mono">Real frame sampling | no scenario simulation | local browser processing</p>
        </div>

        {file && (
          <div className="flex gap-2">
            <button onClick={analyzeVideo} disabled={isProcessing} className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-2">
              {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />} วิเคราะห์เฟรมจริง
            </button>
            <button onClick={reset} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-700 hover:text-white">
              เลือกไฟล์ใหม่
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-8">
          <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 border border-slate-700 shadow-2xl">
            <Upload size={46} className="text-cyan-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 text-center">อัปโหลดวิดีโอจากแหล่งจริง</h2>
          <p className="text-slate-400 text-center mb-8 leading-relaxed max-w-md">
            ระบบจะอ่านเฟรมจากไฟล์ที่คุณเลือกเท่านั้น ไม่มี scenario, chatbot หรือวัตถุปลอม
          </p>
          <label className="group relative px-8 py-4 bg-white text-slate-950 rounded-xl font-bold cursor-pointer transition-all hover:scale-[1.02]">
            <div className="relative flex items-center gap-3">
              <FileVideo size={20} />
              <span>เลือกไฟล์วิดีโอ</span>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
            </div>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl min-h-[420px]">
              <video ref={videoRef} src={videoUrl || ''} className="w-full h-full object-contain" controls playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur border border-white/10 px-3 py-1 rounded text-[10px] text-slate-300 font-mono">
                OP {operationId}
              </div>
            </div>

            {isProcessing && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>กำลัง seek และอ่านเฟรมจริง</span>
                  <span className="font-mono text-white">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200 flex gap-3">
                <AlertTriangle size={18} className="shrink-0" /> {error}
              </div>
            )}
          </div>

          <aside className="space-y-4 min-w-0">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Video size={17} className="text-cyan-300" /> Video Evidence
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-4"><span className="text-slate-500">ชื่อไฟล์</span><span className="text-slate-200 text-right truncate">{file.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ขนาด</span><span className="text-slate-200">{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>
                <div className="flex justify-between"><span className="text-slate-500">แก้ไขล่าสุด</span><span className="text-slate-200">{new Date(file.lastModified).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle size={17} className="text-emerald-300" /> Frame Summary
              </h2>
              {summary ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <div className="text-[10px] text-cyan-200/70 uppercase">Samples</div>
                    <div className="text-lg font-bold text-white">{summary.samples}</div>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <div className="text-[10px] text-cyan-200/70 uppercase">Motion frames</div>
                    <div className="text-lg font-bold text-white">{summary.motionFrames}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <div className="text-[10px] text-slate-500 uppercase">Avg brightness</div>
                    <div className="text-lg font-bold text-white">{summary.avgBrightness.toFixed(0)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <div className="text-[10px] text-slate-500 uppercase">Avg motion</div>
                    <div className="text-lg font-bold text-white">{(summary.avgMotion * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                  กด “วิเคราะห์เฟรมจริง” เพื่อเริ่ม
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <AlertTriangle size={17} className="text-amber-300" /> Events From Frames
              </h2>
              <div className="space-y-2 max-h-[36vh] overflow-y-auto custom-scrollbar pr-1">
                {events.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <WifiOff size={20} className="opacity-50" />
                    ยังไม่มี event จากเฟรมวิดีโอจริง
                  </div>
                ) : events.map(event => (
                  <div key={event.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-cyan-200 bg-cyan-500/10 border-cyan-500/20">{event.type}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{event.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{event.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default VideoAnalytics;
