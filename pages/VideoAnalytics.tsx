
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileVideo, CheckCircle, Clock, Sparkles, FileText, ChevronDown, 
  MessageSquare, Brain, Layers, Database, Scan, RefreshCw, Send, User, Bot
} from 'lucide-react';

// --- Types ---
interface AnalysisEvent {
  id: string;
  timestamp: number;
  type: 'PERSON' | 'VEHICLE' | 'INTRUSION' | 'ANOMALY' | 'WEAPON' | 'FIRE';
  confidence: number;
  description: string;
  metadata?: {
    color?: string;
    direction?: string;
    action?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  objectCount: number;
  events: AnalysisEvent[];
  chatContext: {
    summary: string;
    people: string;
    anomaly: string;
    action: string;
  };
}

// --- Dynamic Scenarios Database ---
const SCENARIOS: Scenario[] = [
  {
    id: 'SEC_CORRIDOR',
    title: 'Suspicious Object - Corridor Zone B',
    description: "วิดีโอแสดงภาพบริเวณทางเดินเชื่อมอาคาร (Corridor Zone B) ในช่วงเวลากลางคืน มีแสงสว่างปานกลาง พบการเคลื่อนไหวของบุคคล 3 ราย และยานพาหนะประเภทรถเข็นส่งของ 1 คัน สภาพแวดล้อมโดยรวมปกติ จนกระทั่งนาทีที่ 00:45 พบวัตถุต้องสงสัยถูกวางทิ้งไว้",
    riskScore: 'High',
    objectCount: 4,
    events: [
      { id: 'e1', timestamp: 5, type: 'PERSON', confidence: 0.98, description: 'Male, Red Shirt, Walking North', metadata: { color: 'Red', direction: 'North', action: 'Walking' } },
      { id: 'e2', timestamp: 12, type: 'VEHICLE', confidence: 0.95, description: 'Delivery Cart, Metallic', metadata: { color: 'Silver', action: 'Moving' } },
      { id: 'e3', timestamp: 45, type: 'ANOMALY', confidence: 0.88, description: 'Abandoned Object (Black Bag)', metadata: { color: 'Black', action: 'Static' } },
      { id: 'e4', timestamp: 52, type: 'INTRUSION', confidence: 0.92, description: 'Person entered restricted zone', metadata: { color: 'Blue', action: 'Running' } }
    ],
    chatContext: {
      summary: "สรุปเหตุการณ์: พบวัตถุต้องสงสัย (กระเป๋าสีดำ) ถูกวางทิ้งไว้ในนาทีที่ 00:45 และมีบุคคลต้องสงสัยวิ่งเข้าพื้นที่หวงห้ามครับ",
      people: "พบผู้คน 2 รายหลักๆ ครับ รายแรกใส่เสื้อแดงเดินผ่านปกติ ส่วนรายที่สองใส่เสื้อน้ำเงินมีพฤติกรรมน่าสงสัยครับ",
      anomaly: "วัตถุต้องสงสัยคือกระเป๋าเป้สีดำ ถูกวางทิ้งไว้หลังเสาด้านขวาครับ",
      action: "แนะนำให้ส่งเจ้าหน้าที่ รปภ. เข้าตรวจสอบพื้นที่ทันที และประกาศเตือนภัยครับ"
    }
  },
  {
    id: 'SAF_FACTORY',
    title: 'Safety Violation - Warehouse A',
    description: "วิดีโอจากกล้องมุมสูงภายในคลังสินค้า A (Warehouse A) ตรวจจับการปฏิบัติงานของพนักงานขับรถ Forklift และพนักงานภาคพื้นดิน พบเหตุการณ์เกือบเฉี่ยวชน (Near-miss) และการไม่สวมหมวกนิรภัย",
    riskScore: 'Medium',
    objectCount: 6,
    events: [
      { id: 'e1', timestamp: 10, type: 'VEHICLE', confidence: 0.99, description: 'Forklift #04 Operating', metadata: { color: 'Yellow', action: 'Lifting' } },
      { id: 'e2', timestamp: 25, type: 'PERSON', confidence: 0.96, description: 'Worker without Helmet', metadata: { color: 'Blue', action: 'Standing' } },
      { id: 'e3', timestamp: 40, type: 'ANOMALY', confidence: 0.91, description: 'Near-miss Accident', metadata: { color: 'Red', action: 'Braking' } }
    ],
    chatContext: {
      summary: "สรุปเหตุการณ์: ตรวจพบการละเมิดกฎความปลอดภัย (ไม่สวมหมวกนิรภัย) และเหตุการณ์รถ Forklift เกือบเฉี่ยวชนพนักงานครับ",
      people: "พบพนักงาน 1 รายที่ไม่สวมหมวกนิรภัย (PPE Violation) ยืนอยู่บริเวณ Lane 3 ครับ",
      anomaly: "ความผิดปกติคือเหตุการณ์ Near-miss ในนาทีที่ 00:40 รถ Forklift เบรกกระทันหันครับ",
      action: "ควรเรียกพนักงานมาตักเตือนเรื่อง PPE และทบทวนกฎจราจรในคลังสินค้าครับ"
    }
  }
];

// --- Component ---
const VideoAnalytics: React.FC = () => {
  // State: File & Processing
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [analysisDone, setAnalysisDone] = useState(false);
  
  // State: Data (Dynamic)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'INSIGHTS' | 'CHAT'>('INSIGHTS');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      startEnterpriseSimulation();
    }
  };

  const startEnterpriseSimulation = () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingStep(0);
    setEvents([]);
    
    // 1. Randomly Select a Scenario
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);

    // Simulate Advanced Pipeline Steps
    const steps = [
      { p: 15, step: 1 }, // Frame Extraction
      { p: 40, step: 2 }, // Object Detection (YOLO)
      { p: 65, step: 3 }, // Vector Embedding (CLIP/ViT)
      { p: 85, step: 4 }, // Temporal Reasoning (LLM)
      { p: 100, step: 5 } // Finalizing
    ];

    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      const target = steps[currentStepIndex];
      
      setProgress(prev => {
        const next = prev + (Math.random() * 3); // Faster simulation
        if (next >= target.p) {
          setProcessingStep(target.step);
          currentStepIndex++;
          if (currentStepIndex >= steps.length) {
            clearInterval(interval);
            finishAnalysis(randomScenario);
            return 100;
          }
        }
        return next;
      });
    }, 80);
  };

  const finishAnalysis = (scenario: Scenario) => {
    setEvents(scenario.events);
    setIsProcessing(false);
    setAnalysisDone(true);
    
    // Set Initial Chat
    setChatMessages([
      {
        id: 'welcome',
        role: 'ai',
        content: `วิเคราะห์เสร็จสิ้นครับ (Scenario: ${scenario.title})\n\nระบบตรวจพบ ${scenario.objectCount} วัตถุ และประเมินความเสี่ยงระดับ "${scenario.riskScore}"\n\nคุณสามารถถามรายละเอียดเพิ่มเติมได้ครับ`,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentScenario) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    // Simulate AI Thinking
    const thinkingMsgId = 'thinking-' + Date.now();
    setChatMessages(prev => [...prev, {
      id: thinkingMsgId,
      role: 'ai',
      content: 'กำลังวิเคราะห์ข้อมูล (Reasoning)...',
      timestamp: new Date(),
      isThinking: true
    }]);

    // Intelligent Response Logic (Context-Aware)
    setTimeout(() => {
      let responseText = "ขออภัยครับ ผมไม่แน่ใจในคำถาม ลองถามเกี่ยวกับ เหตุการณ์, บุคคล, หรือ ความผิดปกติ ดูนะครับ";
      const q = userMsg.content.toLowerCase();
      const ctx = currentScenario.chatContext;

      if (q.includes('สรุป') || q.includes('summary') || q.includes('เกิดอะไร')) {
        responseText = ctx.summary;
      } else if (q.includes('คน') || q.includes('who') || q.includes('แดง') || q.includes('เสื้อ')) {
        responseText = ctx.people;
        const pEvent = currentScenario.events.find(e => e.type === 'PERSON' || e.type === 'INTRUSION');
        if (pEvent) jumpTo(pEvent.timestamp);
      } else if (q.includes('วัตถุ') || q.includes('ผิดปกติ') || q.includes('anomaly') || q.includes('กระเป๋า')) {
        responseText = ctx.anomaly;
        const aEvent = currentScenario.events.find(e => e.type === 'ANOMALY' || e.type === 'INTRUSION');
        if (aEvent) jumpTo(aEvent.timestamp);
      } else if (q.includes('ทำอย่างไร') || q.includes('action') || q.includes('แนะนำ')) {
        responseText = ctx.action;
      }

      setChatMessages(prev => prev.map(msg => 
        msg.id === thinkingMsgId 
          ? { ...msg, content: responseText, isThinking: false } 
          : msg
      ));
    }, 1200);
  };

  // Utilities
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const jumpTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl(null);
    setAnalysisDone(false);
    setEvents([]);
    setCurrentScenario(null);
    setChatMessages([]);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans animate-fade-in">
      {/* --- Top Bar --- */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
           <div className="flex items-center gap-2">
             <Brain className="text-primary-400" size={24} />
             <h1 className="text-2xl font-bold text-white tracking-tight">ศูนย์วิเคราะห์อัจฉริยะ VisionGuard</h1>
           </div>
           <p className="text-slate-400 text-xs mt-1 ml-8 font-mono">
             ขับเคลื่อนโดย GEMINI PRO VISION & YOLOv8 • วิเคราะห์แบบ Multimodal
           </p>
        </div>
        {analysisDone && (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700 hover:text-white flex items-center gap-2">
               <FileText size={14} /> ส่งออกรายงาน
            </button>
            <button onClick={reset} className="px-3 py-1.5 bg-primary-600 text-white rounded text-xs hover:bg-primary-500 shadow-lg shadow-primary-900/20 flex items-center gap-2">
               <RefreshCw size={14} /> วิเคราะห์วิดีโอใหม่
            </button>
          </div>
        )}
      </div>

      {/* --- Main Content --- */}
      {!file ? (
        // Upload State
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 to-slate-950/50"></div>
           
           <div className="relative z-10 flex flex-col items-center p-12 max-w-2xl w-full">
              <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 border border-slate-700 shadow-2xl shadow-primary-900/20 group">
                 <Upload size={48} className="text-primary-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4 text-center">อัปโหลดวิดีโอเพื่อวิเคราะห์เชิงลึก</h2>
              <p className="text-slate-400 text-center mb-8 leading-relaxed max-w-md">
                รองรับการวิเคราะห์แบบ Multimodal ด้วย LLM ขั้นสูง สามารถระบุตัวตน พฤติกรรม และความผิดปกติได้ในระดับ Semantic
              </p>

              <label className="group relative px-8 py-4 bg-white text-slate-950 rounded-xl font-bold cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                 <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative flex items-center gap-3">
                    <FileVideo size={20} />
                    <span>เลือกไฟล์วิดีโอ</span>
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
                 </div>
              </label>

              <div className="mt-8 flex gap-6 text-xs text-slate-500 font-mono">
                 <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> .MP4 / .MOV</span>
                 <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> Up to 4K 60fps</span>
                 <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> เข้ารหัสปลอดภัย</span>
              </div>
           </div>
        </div>
      ) : isProcessing ? (
        // Processing State
        <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-slate-950 to-slate-950"></div>
           
           <div className="relative z-10 w-full max-w-3xl p-8">
              <div className="flex justify-between items-end mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-2">กำลังวิเคราะห์วิดีโอ...</h3>
                   <p className="text-primary-400 font-mono text-sm">Operation ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                 </div>
                 <div className="text-4xl font-bold text-white font-mono">{Math.floor(progress)}%</div>
              </div>

              {/* Advanced Progress Bar */}
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-12">
                 <div className="h-full bg-gradient-to-r from-primary-600 via-cyan-400 to-primary-600 w-full animate-[shimmer_2s_infinite]" style={{ transform: `translateX(-${100 - progress}%)` }}></div>
              </div>

              {/* Processing Steps Visualization */}
              <div className="grid grid-cols-5 gap-4">
                 {[
                   { icon: Layers, label: "แยกเฟรมภาพ" },
                   { icon: Scan, label: "ตรวจจับวัตถุ" },
                   { icon: Database, label: "สร้าง Vector" },
                   { icon: Brain, label: "วิเคราะห์เวลา" },
                   { icon: Sparkles, label: "สรุปข้อมูล" }
                 ].map((step, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-3 transition-opacity duration-500 ${processingStep >= idx + 1 ? 'opacity-100' : 'opacity-30'}`}>
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${processingStep === idx + 1 ? 'bg-primary-500/20 border-primary-500 text-primary-400 animate-pulse' : processingStep > idx + 1 ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                          {processingStep > idx + 1 ? <CheckCircle size={24} /> : <step.icon size={24} />}
                       </div>
                       <span className="text-xs font-medium text-slate-300 text-center">{step.label}</span>
                    </div>
                 ))}
              </div>

              {/* Terminal Output Simulation */}
              <div className="mt-12 p-4 bg-black/50 rounded-lg border border-slate-800 font-mono text-xs h-32 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"></div>
                 <div className="space-y-1 text-slate-400">
                    <p>> Initializing CUDA cores...</p>
                    <p className={progress > 10 ? 'text-green-400' : 'opacity-0'}>> Frame buffer loaded (1800 frames)</p>
                    <p className={progress > 30 ? 'text-green-400' : 'opacity-0'}>> YOLOv8 Inference: Found {currentScenario?.objectCount || 0} objects</p>
                    <p className={progress > 50 ? 'text-green-400' : 'opacity-0'}>> CLIP Encoder: Generating semantic vectors...</p>
                    <p className={progress > 70 ? 'text-green-400' : 'opacity-0'}>> LLM Context Window: 128k tokens filled</p>
                    <p className={progress > 90 ? 'text-cyan-400' : 'opacity-0'}>> Finalizing report structure...</p>
                    <p className="animate-pulse">> _</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        // Analysis Result View
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
           
           {/* LEFT: Video & Timeline */}
           <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex-1 group">
                 <video 
                   ref={videoRef}
                   src={videoUrl || ''} 
                   className="w-full h-full object-contain"
                   controls
                   playsInline
                 />
                 
                 {/* Professional Overlay */}
                 <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur border border-slate-700 px-3 py-1 rounded text-[10px] text-white font-mono flex items-center gap-2">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC
                    </div>
                    <div className="bg-black/80 backdrop-blur border border-slate-700 px-3 py-1 rounded text-[10px] text-primary-300 font-mono">
                       AI CONFIDENCE: 98.4%
                    </div>
                 </div>
              </div>

              {/* Advanced Timeline */}
              <div className="h-32 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-2 relative">
                 <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Event Timeline</span>
                    <span>01:00 Duration</span>
                 </div>
                 
                 <div className="flex-1 relative bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer">
                    {/* Time Markers */}
                    <div className="absolute inset-0 flex justify-between px-2 opacity-20 pointer-events-none">
                       {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-slate-400"></div>)}
                    </div>

                    {/* Events */}
                    {events.map(evt => (
                       <div 
                         key={evt.id}
                         className={`absolute top-2 bottom-2 w-1.5 rounded-full cursor-pointer hover:scale-125 transition-transform z-10 group/pin ${
                           evt.type === 'INTRUSION' || evt.type === 'FIRE' ? 'bg-red-500' : 
                           evt.type === 'ANOMALY' ? 'bg-orange-500' : 
                           evt.type === 'PERSON' ? 'bg-cyan-500' : 'bg-blue-500'
                         }`}
                         style={{ left: `${(evt.timestamp / 60) * 100}%` }}
                         onClick={() => jumpTo(evt.timestamp)}
                       >
                         {/* Tooltip */}
                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 pointer-events-none z-20">
                            <span className="font-bold">{evt.type}</span> @ {formatTime(evt.timestamp)}
                         </div>
                       </div>
                    ))}
                 </div>
                 
                 {/* Legend */}
                 <div className="flex gap-4 text-[10px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Person</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Vehicle</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Threat</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Anomaly</span>
                 </div>
              </div>
           </div>

           {/* RIGHT: Intelligent Dashboard */}
           <div className="w-96 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                 <button 
                   onClick={() => setActiveTab('INSIGHTS')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'INSIGHTS' ? 'bg-slate-800 text-white border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   ข้อมูลเชิงลึก
                 </button>
                 <button 
                   onClick={() => setActiveTab('CHAT')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'CHAT' ? 'bg-slate-800 text-white border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   AI Assistant <span className="bg-primary-600 text-white px-1 rounded ml-1 text-[9px]">BETA</span>
                 </button>
              </div>

              {activeTab === 'INSIGHTS' && currentScenario && (
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {/* Scene Summary */}
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                         <Scan size={14} /> ความเข้าใจสถานการณ์
                       </h4>
                       <p className="text-sm text-slate-300 leading-relaxed font-sans">
                         {currentScenario.description}
                       </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                          <div className="text-[10px] text-slate-500 uppercase">ระดับความเสี่ยง</div>
                          <div className={`text-2xl font-bold ${currentScenario.riskScore === 'Critical' ? 'text-red-500' : currentScenario.riskScore === 'High' ? 'text-orange-500' : 'text-yellow-400'}`}>
                             {currentScenario.riskScore}
                          </div>
                       </div>
                       <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                          <div className="text-[10px] text-slate-500 uppercase">จำนวนวัตถุ</div>
                          <div className="text-2xl font-bold text-white">{currentScenario.objectCount}</div>
                       </div>
                    </div>

                    {/* Detected Objects List */}
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <Layers size={14} /> วัตถุที่ตรวจพบ
                       </h4>
                       <div className="space-y-2">
                          {events.map((evt, i) => (
                             <div key={i} onClick={() => jumpTo(evt.timestamp)} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 group transition-all">
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${evt.type === 'INTRUSION' ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                                   {evt.confidence > 0.9 ? 'A+' : 'A'}
                                </div>
                                <div className="flex-1">
                                   <div className="text-sm font-medium text-slate-200 group-hover:text-primary-400">{evt.description}</div>
                                   <div className="text-[10px] text-slate-500 flex gap-2">
                                      <span className="flex items-center gap-1"><Clock size={10}/> {formatTime(evt.timestamp)}</span>
                                      <span>•</span>
                                      <span>Conf: {Math.floor(evt.confidence * 100)}%</span>
                                   </div>
                                </div>
                                <ChevronDown size={14} className="text-slate-600 -rotate-90 group-hover:text-slate-400" />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'CHAT' && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={chatScrollRef}>
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                        <MessageSquare size={32} className="mb-2 opacity-50" />
                        <p className="text-xs">สอบถาม VisionGuard เกี่ยวกับวิดีโอนี้</p>
                      </div>
                    )}
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-700'}`}>
                          {msg.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-cyan-400"/>}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary-600/20 text-white border border-primary-500/30 rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                          {msg.isThinking ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Sparkles size={14} className="animate-spin" /> {msg.content}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="ถามเกี่ยวกับเหตุการณ์..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:border-primary-500 focus:outline-none placeholder-slate-600"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 rounded-md text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalytics;
