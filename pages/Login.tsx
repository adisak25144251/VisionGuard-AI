
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Fingerprint, ChevronRight, Loader2, Globe } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Creds, 2: MFA
  const [email, setEmail] = useState('admin@visionguard.ai');
  const [password, setPassword] = useState('password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleMFA = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('visionguard_token', 'mock-jwt-token-secure');
      setIsLoading(false);
      navigate('/');
    }, 1500);
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
                <h2 className="text-2xl font-bold text-white">Sign in to Command Center</h2>
                <p className="text-slate-400 text-sm mt-2">Enter your credentials to access the secure dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Work Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ChevronRight size={18} /></>}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="#" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Forgot your password?</a>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in text-center">
               <div className="w-16 h-16 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/30">
                 <Fingerprint size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
               <p className="text-slate-400 text-sm mb-6">
                 For security, please verify your identity using your biometrics or hardware key.
               </p>

               <div className="space-y-3">
                 <button 
                   onClick={handleMFA}
                   className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
                 >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Use Touch ID / Face ID</>}
                 </button>
                 <button className="w-full bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white py-2 rounded-lg text-sm transition-all">
                    Use Authenticator Code
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
