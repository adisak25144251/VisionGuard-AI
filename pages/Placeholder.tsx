import React from 'react';

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center animate-fade-in">
      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
         <div className="absolute inset-0 border-2 border-slate-700 rounded-full animate-ping opacity-20"></div>
         <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-3xl font-bold text-slate-100 mb-2">{title}</h2>
      <p className="text-slate-400 max-w-md mb-8">{description}</p>
      
      <div className="glass-panel p-6 rounded-xl border border-slate-700 max-w-lg w-full text-left">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Planned Features (v2.0)</h3>
        <ul className="space-y-2 text-sm text-slate-400">
           <li className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Backend API Integration pending</li>
           <li className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Real-time WebSocket data stream</li>
           <li className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Advanced filtering and export options</li>
        </ul>
      </div>
    </div>
  );
};

export default Placeholder;
