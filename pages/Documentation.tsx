
import React, { useState } from 'react';
import { Server, Cpu, Database, Network, Code, Layers, Activity, Lock, GitBranch, Table, FileJson, Key, Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { ALERT_TEMPLATES, AlertTemplate } from '../services/alertTemplates';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'arch' | 'data' | 'scale' | 'db' | 'alerts'>('alerts');
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate>(ALERT_TEMPLATES['SUSPICIOUS_DETECTED'] || Object.values(ALERT_TEMPLATES)[0]);
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  const fillTemplate = (template: string, placeholders: Record<string, string>) => {
    let result = template;
    if (!placeholders) return result;
    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.replace(`{${key}}`, value);
    });
    return result;
  };

  const getActiveExample = () => {
    if (!selectedTemplate || !selectedTemplate.examples || selectedTemplate.examples.length === 0) {
      return { situation: 'Default', placeholders: {} };
    }
    return selectedTemplate.examples[selectedExampleIndex] || selectedTemplate.examples[0];
  };

  const handleTemplateChange = (template: AlertTemplate) => {
    setSelectedTemplate(template);
    setSelectedExampleIndex(0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        const example = getActiveExample();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="text-yellow-400" /> System Alert Templates
            </h2>
            <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
              {/* Template List */}
              <div className="w-full lg:w-1/3 glass-panel rounded-xl overflow-hidden flex flex-col border border-slate-700">
                <div className="p-4 bg-slate-900 border-b border-slate-700">
                  <h3 className="font-semibold text-slate-300">Feature Categories</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {Object.values(ALERT_TEMPLATES).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTemplateChange(tpl)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                        selectedTemplate?.id === tpl.id 
                          ? 'bg-primary-600/20 border border-primary-500/50 text-white' 
                          : 'hover:bg-slate-800 text-slate-400 border border-transparent'
                      }`}
                    >
                      <div className="font-bold flex justify-between items-center">
                        {tpl.featureName.split('(')[0]}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          tpl.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          tpl.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          tpl.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {tpl.severity}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-70 mt-1">{tpl.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Scenario Selector */}
                <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 text-sm font-semibold">Simulated Scenario:</span>
                  <div className="flex gap-2">
                    {selectedTemplate?.examples?.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedExampleIndex(idx)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          selectedExampleIndex === idx 
                            ? 'bg-white text-slate-900' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Situation {idx + 1}: {ex.situation}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Preview */}
                  <div className="bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden relative max-w-xs mx-auto w-full flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-7 bg-black flex justify-center z-20">
                      <div className="w-24 h-4 bg-black rounded-b-xl"></div>
                    </div>
                    
                    {/* Lock Screen UI */}
                    <div 
                      className="flex-1 bg-cover bg-center flex flex-col pt-12 px-4 relative"
                      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop)' }}
                    >
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                      <div className="z-10 text-center mb-8">
                        <h2 className="text-4xl font-light text-white drop-shadow-md">09:41</h2>
                        <p className="text-white/80 text-sm drop-shadow-md">Tuesday, 12 October</p>
                      </div>

                      {/* Notification Card */}
                      <div className="z-10 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg mb-2 animate-fade-in">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-tr from-cyan-500 to-primary-600 rounded flex items-center justify-center">
                              <Bell size={10} className="text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800">VisionGuard AI</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Now</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {selectedTemplate ? fillTemplate(selectedTemplate.shortMessage, example.placeholders) : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/LINE Preview */}
                  <div className="flex flex-col">
                    <div className="bg-[#1b1e25] rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex-1">
                      <div className="bg-[#2c3e50] px-4 py-3 flex items-center justify-between border-b border-slate-600">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded bg-[#06c755] flex items-center justify-center text-white">
                             <MessageSquare size={18} fill="white" />
                           </div>
                           <span className="text-white font-bold">VisionGuard Notify</span>
                        </div>
                        <span className="text-xs text-slate-400">10:42 AM</span>
                      </div>
                      <div className="p-4 bg-[#8c9eff]/10 h-full">
                         <div className="bg-white text-slate-800 rounded-lg rounded-tl-none p-4 shadow-sm max-w-[95%] relative">
                           {/* Message Body */}
                           <div className="prose prose-sm prose-slate mb-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                             {selectedTemplate ? fillTemplate(selectedTemplate.longMessage, example.placeholders).split('\n').map((line, i) => (
                               <React.Fragment key={i}>
                                 {line.includes('**') ? 
                                   <strong className="block text-primary-700 mb-1 text-base">{line.replace(/\*\*/g, '')}</strong> : 
                                   <span className="block">{line}</span>
                                 }
                               </React.Fragment>
                             )) : null}
                           </div>
                           
                           {/* English Subtitle */}
                           <div className="border-t border-slate-200 pt-2 mb-3">
                             <p className="text-xs text-slate-500 italic">
                               EN: {selectedTemplate?.englishSubtitle}
                             </p>
                           </div>

                           {/* Image Placeholder */}
                           <div className="w-full h-32 bg-slate-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                              <img src="https://picsum.photos/600/300" className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <span className="px-3 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                                  <Activity size={12} /> Live Snapshot
                                </span>
                              </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="grid grid-cols-1 gap-2">
                             {selectedTemplate?.actions.map((action, i) => (
                               <button 
                                 key={i}
                                 className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-primary-600 text-xs font-bold rounded border border-slate-200 transition-colors"
                               >
                                 {action}
                               </button>
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stack':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechCard title="Frontend Framework" icon={Code} items={['React 18 (TypeScript)', 'Tailwind CSS', 'Vite', 'Lucide Icons']} color="blue" />
            <TechCard title="AI / Inference" icon={Cpu} items={['TensorFlow.js', 'ONNX Runtime', 'YOLOv8 (Object Detection)', 'Face-API.js']} color="purple" />
            <TechCard title="Backend & API" icon={Server} items={['Node.js / Express', 'Python (FastAPI)', 'WebSocket (Socket.io)', 'Redis (Cache)']} color="green" />
            <TechCard title="Database" icon={Database} items={['PostgreSQL (Metadata)', 'MongoDB (Logs)', 'MinIO (Object Storage)']} color="orange" />
            <TechCard title="DevOps" icon={GitBranch} items={['Docker Containers', 'GitHub Actions', 'Nginx Proxy', 'Prometheus/Grafana']} color="red" />
            <TechCard title="Security" icon={Lock} items={['JWT Auth', 'Role-Based Access (RBAC)', 'AES-256 Encryption', 'HTTPS/TLS']} color="cyan" />
          </div>
        );
        
      default:
        return (
           <div className="flex flex-col items-center justify-center h-96 text-slate-500">
             <FileJson size={48} className="mb-4 opacity-50" />
             <p>Documentation for this section is being generated...</p>
           </div>
        );
    }
  };

  const TechCard = ({ title, icon: Icon, items, color }: any) => (
    <div className="glass-panel p-6 rounded-xl border border-slate-700/50 hover:border-slate-500 transition-colors">
      <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 text-${color}-400 flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-center text-sm text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 mr-2`}></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === id 
          ? 'border-primary-500 text-white bg-slate-800/50' 
          : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
      }`}
    >
      <Icon size={16} className="mr-2" />
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-primary-500 text-transparent bg-clip-text">
          System Architecture & Specs
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Comprehensive documentation for developers and system administrators.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center border-b border-slate-800 mb-8">
        <TabButton id="alerts" label="Alert System" icon={Bell} />
        <TabButton id="stack" label="Tech Stack" icon={Layers} />
        <TabButton id="arch" label="Architecture" icon={Network} />
        <TabButton id="data" label="Data Models" icon={Table} />
        <TabButton id="scale" label="Scalability" icon={Activity} />
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Documentation;
