
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Fingerprint, ChevronRight, Globe } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('VisionGuard Local');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !workspaceName.trim()) return;
    setStep(2);
  };

  const handleMFA = () => {
    const session = {
      id: crypto.randomUUID?.() || `local-${Date.now()}`,
      email,
      workspaceName,
      createdAt: new Date().toISOString(),
      mode: 'LOCAL_DEVICE_SESSION'
    };
    localStorage.setItem('visionguard_token', JSON.stringify(session));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      {/* Left Column: Hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative z-10 border-r border-slate-800/50">
        <div>
          <div className="flex items-center gap-2 text-white mb-8">
            <Zap className="text-primary-500 fill-primary-500" size={32} />
            <span className="text-2xl font-bold tracking-tight">VisionGuard AI</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Enterprise Grade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
              Security Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Unified surveillance platform powered by Deep Learning. Detect threats, manage access, and ensure safety with real-time analytics.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur">
            <ShieldCheck className="text-green-400 mb-2" size={24} />
            <h3 className="text-white font-bold">Gov-Cloud Ready</h3>
            <p className="text-xs text-slate-500 mt-1">Compliant with Enterprise Security Standards</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur">
            <Globe className="text-blue-400 mb-2" size={24} />
            <h3 className="text-white font-bold">Global Scale</h3>
            <p className="text-xs text-slate-500 mt-1">Multi-site management with &lt; 200ms latency</p>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          © 2024 VisionGuard AI Inc. All rights reserved. | System v3.2.0
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {step === 1 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Start Local Command Session</h2>
                <p className="text-slate-400 text-sm mt-2">สำหรับใช้งาน webcam จริงบนอุปกรณ์นี้โดยไม่สร้างข้อมูลจำลอง</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Work Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Workspace</label>
                  <input 
                    type="text" 
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={!email.trim() || !workspaceName.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-xs text-slate-500">ต้องการ SSO/JWT จริงให้เชื่อมต่อ backend ผ่าน environment/API</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in text-center">
               <div className="w-16 h-16 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/30">
                 <Fingerprint size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Device Trust Confirmation</h2>
               <p className="text-slate-400 text-sm mb-6">
                 ยืนยันว่าการ session นี้เป็น local device session และข้อมูลวิเคราะห์มาจากกล้องจริงของผู้ใช้
               </p>

               <label className="flex gap-3 text-left bg-slate-900/70 border border-slate-800 rounded-lg p-3 mb-4 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={acknowledged}
                   onChange={(event) => setAcknowledged(event.target.checked)}
                   className="mt-1 accent-primary-500"
                 />
                 <span className="text-xs text-slate-400 leading-relaxed">
                   ฉันเข้าใจว่าโหมดนี้ไม่ใช่ SSO backend แต่เป็น session ใน browser สำหรับเปิด webcam จริงบน HTTPS/Vercel
                 </span>
               </label>

               <div className="space-y-3">
                 <button 
                   onClick={handleMFA}
                   disabled={!acknowledged}
                   className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
                 >
                    Start Monitoring Session
                 </button>
                 <button onClick={() => setStep(1)} className="w-full bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white py-2 rounded-lg text-sm transition-all">
                    Back
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
