
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Play, CheckCircle } from 'lucide-react';

interface DemoGuideProps {
  onClose: () => void;
  onStartDemo: () => void;
}

const DemoGuide: React.FC<DemoGuideProps> = ({ onClose, onStartDemo }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to VisionGuard AI",
      desc: "Experience our Enterprise-grade AI surveillance system in action. We've prepared a simulated environment for you.",
      icon: <Play size={32} className="text-primary-400" />
    },
    {
      title: "Real-time Detection",
      desc: "Watch how our Deep Learning models identify people, vehicles, and potential threats instantly.",
      icon: <div className="w-8 h-8 border-2 border-green-500 rounded animate-pulse" />
    },
    {
      title: "Smart Alerts",
      desc: "Simulated events (Falls, Intrusions) will trigger alerts. Try clicking them to see how we handle incidents.",
      icon: <div className="w-8 h-8 bg-red-500 rounded-full animate-bounce" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onStartDemo();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 relative shadow-2xl overflow-hidden">
        {/* Background Decor */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-inner">
            {steps[step].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">{steps[step].title}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {steps[step].desc}
          </p>

          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : 'w-2 bg-slate-700'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center"
          >
            {step === steps.length - 1 ? (
              <span className="flex items-center">Start Simulation <CheckCircle size={20} className="ml-2" /></span>
            ) : (
              <span className="flex items-center">Next <ChevronRight size={20} className="ml-2" /></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoGuide;
