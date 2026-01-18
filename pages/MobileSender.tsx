
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, RefreshCw, Wifi, WifiOff, Video, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import Peer from 'peerjs';

const MobileSender: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [status, setStatus] = useState<'INIT' | 'READY' | 'STREAMING' | 'ERROR'>('INIT');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Controls
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!targetId) {
      setStatus('ERROR');
      return;
    }

    const init = async () => {
      try {
        // 1. Get Camera with Fallback logic
        let mediaStream: MediaStream;
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: true
            });
        } catch (err) {
            console.warn("Specific camera request failed, falling back to default:", err);
            // Fallback: try any video source
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // 2. Init Peer
        const newPeer = new Peer(targetId, {
          debug: 2
        });

        newPeer.on('open', (id) => {
          setPeerId(id);
          setStatus('READY');
        });

        newPeer.on('call', (call) => {
          console.log("Receiving call from dashboard...");
          call.answer(mediaStream);
          setStatus('STREAMING');
        });

        newPeer.on('error', (err) => {
          console.error("Peer Error:", err);
          if (err.type === 'unavailable-id') {
             // If ID is taken, it might just mean we are reconnecting or duplicate tab
             setStatus('READY'); 
          } else {
             setStatus('ERROR');
          }
        });

        setPeer(newPeer);

      } catch (err) {
        console.error("Failed to init mobile sender:", err);
        setStatus('ERROR');
      }
    };

    init();

    return () => {
      peer?.destroy();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [targetId, facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Note: React will re-run the effect because facingMode dependency changed
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${status === 'STREAMING' ? 'bg-green-500 animate-pulse' : status === 'READY' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
           <span className="font-bold text-sm tracking-wider">VISIONGUARD MOBILE</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          ID: {targetId?.substring(0, 6)}...
        </div>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {status === 'ERROR' ? (
           <div className="text-center p-8">
             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <WifiOff size={32} />
             </div>
             <h2 className="text-xl font-bold mb-2">การเชื่อมต่อล้มเหลว</h2>
             <p className="text-slate-400 text-sm">ไม่สามารถเข้าถึงกล้องหรือเชื่อมต่อกับเซิร์ฟเวอร์ได้</p>
             <p className="text-slate-500 text-xs mt-2">กรุณาอนุญาตสิทธิ์การเข้าถึงกล้องและไมโครโฟน</p>
           </div>
        ) : (
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted 
             className={`w-full h-full object-cover transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
           />
        )}
        
        {/* Overlay Info */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono">
           {status === 'INIT' && 'กำลังเริ่มต้น...'}
           {status === 'READY' && 'รอการเชื่อมต่อจาก Dashboard...'}
           {status === 'STREAMING' && '🔴 กำลังถ่ายทอดสด'}
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-6 pt-4 px-8">
         <button 
           onClick={toggleVideo}
           className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'}`}
         >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
         </button>

         <button 
           onClick={toggleCamera} 
           className="p-6 bg-primary-600 rounded-full text-white shadow-lg shadow-primary-900/50 hover:scale-105 transition-transform"
         >
            <RefreshCw size={32} />
         </button>

         <button 
           onClick={toggleMute}
           className={`p-4 rounded-full transition-all ${isMuted ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-white'}`}
         >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>
      </div>
    </div>
  );
};

export default MobileSender;
