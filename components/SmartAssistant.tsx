
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Mic, Send, X, Bot, User, Clock, MapPin, 
  Car, AlertTriangle, PlayCircle, Fingerprint, Lock, ChevronRight
} from 'lucide-react';
import { processSmartQuery } from '../services/mockAiService';
import { SmartQueryResult, EvidencePack } from '../types';

interface SmartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResultCard: React.FC<{ pack: EvidencePack }> = ({ pack }) => (
  <div className="flex gap-3 bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-slate-600 transition-colors group cursor-pointer">
    <div className="w-24 h-16 bg-black rounded overflow-hidden relative flex-shrink-0">
      <img src={pack.snapshots[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40">
        <PlayCircle size={20} className="text-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <span className={`text-[10px] font-bold px-1.5 rounded border ${pack.severity === 'CRITICAL' ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-blue-900/20 text-blue-400 border-blue-500/30'}`}>
          {pack.eventType}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{pack.timestamp.toLocaleTimeString()}</span>
      </div>
      <div className="text-xs text-slate-300 font-bold mt-1 truncate">{pack.cameraName}</div>
      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
         {pack.metadata.attributes?.color && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {pack.metadata.attributes.color[0]}</span>}
         <span>Conf: {Math.floor(pack.metadata.confidence * 100)}%</span>
      </div>
    </div>
  </div>
);

const SmartAssistant: React.FC<SmartAssistantProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string | SmartQueryResult}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{ role: 'ai', content: 'สวัสดีครับ VisionGuard AI พร้อมช่วยค้นหาข้อมูลความปลอดภัยครับ ลองถามเช่น "เมื่อคืนมีใครเข้าประตูหน้าไหม" หรือ "หารถสีขาว"' }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQ }]);
    setIsProcessing(true);

    // Simulate API Delay
    setTimeout(() => {
      const result = processSmartQuery(userQ);
      setMessages(prev => [...prev, { role: 'ai', content: result }]);
      setIsProcessing(false);
    }, 1200);
  };

  const renderContent = (msg: {role: string, content: string | SmartQueryResult}) => {
    if (typeof msg.content === 'string') return <div className="leading-relaxed">{msg.content}</div>;
    
    const res = msg.content as SmartQueryResult;
    
    return (
      <div className="space-y-3">
        <p className={`font-medium ${res.accessDenied ? 'text-red-400' : 'text-slate-200'}`}>{res.textResponse}</p>
        
        {/* Filters Badge */}
        {!res.accessDenied && Object.keys(res.detectedFilters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(res.detectedFilters).map(([k, v]) => (
              <span key={k} className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1">
                {k === 'time' && <Clock size={10}/>}
                {k === 'location' && <MapPin size={10}/>}
                {k === 'color' && <Fingerprint size={10}/>}
                {v}
              </span>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {res.data.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {res.data.map(pack => <ResultCard key={pack.id} pack={pack} />)}
          </div>
        )}
        
        {res.data.length > 0 && (
           <button className="text-xs text-primary-400 hover:underline flex items-center gap-1 mt-1">
             View all results in Evidence Vault <ChevronRight size={12}/>
           </button>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold">
            <Bot className="text-primary-400" /> VisionGuard Assistant
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white bg-slate-800 p-1 rounded-full"><X size={16} /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-950/50" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-cyan-600'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white"/> : <Bot size={16} className="text-white"/>}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-900/20 border border-primary-500/30 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none shadow-md'}`}>
                {renderContent(msg)}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shrink-0"><Bot size={16} className="text-white"/></div>
               <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSearch} className="relative">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Ask anything in Thai... (e.g., 'หารถสีขาวที่จอดนานเกิน 15 นาที')"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
               {query ? (
                 <button type="submit" className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                    <Send size={16} />
                 </button>
               ) : (
                 <button type="button" className="p-2 text-slate-500 hover:text-white transition-colors">
                    <Mic size={18} />
                 </button>
               )}
            </div>
          </form>
          <div className="text-[10px] text-slate-500 mt-2 text-center flex justify-center gap-4">
             <span>Try: "เมื่อคืนมีใครเข้า Server Room ไหม"</span>
             <span>"สรุปเหตุการณ์วันนี้"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;
