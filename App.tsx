
import React, { useState, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import Events from './pages/Events';
import Documentation from './pages/Documentation';
import LPR from './pages/LPR';
import FaceRecognition from './pages/FaceRecognition';
import FeatureCenter from './pages/FeatureCenter';
import EvidenceVault from './pages/EvidenceVault';
import IntrusionDetection from './pages/IntrusionDetection';
import VideoAnalytics from './pages/VideoAnalytics';
import Settings from './pages/Settings';
import LaneCounting from './pages/LaneCounting';
import SafetyFire from './pages/SafetyFire';
import ParkingManagement from './pages/ParkingManagement';
import MobileSender from './pages/MobileSender';
import SecurityHealth from './pages/SecurityHealth';
import TraceRoute from './pages/TraceRoute';
import AnomalyDetection from './pages/AnomalyDetection';
import TamperDetection from './pages/TamperDetection'; 
import DailySummary from './pages/DailySummary'; 
import BehaviorAnalytics from './pages/BehaviorAnalytics'; 
import ModelHealth from './pages/ModelHealth';
import MapOperations from './pages/MapOperations';
import ErrorBoundary from './components/ErrorBoundary';
import SmartAssistant from './components/SmartAssistant';
import { Bell, Menu, Search, Activity, Wifi, HelpCircle, LogOut, Bot } from 'lucide-react';

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-mono animate-pulse">Initializing System...</span>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const token = localStorage.getItem('visionguard_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout><Outlet /></AppLayout>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smartAssistantOpen, setSmartAssistantOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('visionguard_token');
    window.location.href = '#/login';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSmartAssistantOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(false)} />
      
      <SmartAssistant isOpen={smartAssistantOpen} onClose={() => setSmartAssistantOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300 h-screen">
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden xl:flex items-center gap-4 text-xs font-mono border-l border-slate-800 pl-4 ml-2">
              <div className="flex items-center gap-2 text-green-400">
                <Wifi size={14} /> <span>SIGNAL: EXCELLENT</span>
              </div>
              <div className="flex items-center gap-2 text-primary-400">
                <Activity size={14} /> <span>LATENCY: 14ms</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Ask VisionGuard AI (Type Ctrl+K)..." 
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500/50 transition-all text-sm placeholder-slate-600 font-sans cursor-pointer hover:bg-slate-900"
                readOnly
                onClick={() => setSmartAssistantOpen(true)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 cursor-pointer" onClick={() => setSmartAssistantOpen(true)}>
                <Bot size={16} className="text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Support">
              <HelpCircle size={20} />
            </button>
            
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-800 mx-1"></div>
            
            <div className="relative group">
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">Admin User</div>
                  <div className="text-[10px] text-slate-500 uppercase">Operations</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">
                  AD
                </div>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 first:rounded-t-xl last:rounded-b-xl"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/mobile-sender" element={<MobileSender />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<LiveMonitor />} />
              <Route path="/events" element={<Events />} />
              <Route path="/docs" element={<Documentation />} />
              
              <Route path="/features" element={<FeatureCenter />} />
              <Route path="/lpr" element={<LPR />} />
              <Route path="/face-rec" element={<FaceRecognition />} />
              <Route path="/trace-route" element={<TraceRoute />} />
              <Route path="/behavior" element={<BehaviorAnalytics />} />
              <Route path="/anomaly" element={<AnomalyDetection />} />
              <Route path="/model-health" element={<ModelHealth />} />
              <Route path="/map-ops" element={<MapOperations />} />
              <Route path="/tamper" element={<TamperDetection />} />
              <Route path="/daily-summary" element={<DailySummary />} /> 
              <Route path="/evidence" element={<EvidenceVault />} />
              <Route path="/intrusion" element={<IntrusionDetection />} />
              <Route path="/upload" element={<VideoAnalytics />} />
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/security-health" element={<SecurityHealth />} />

              <Route path="/lane-counting" element={<LaneCounting />} />
              <Route path="/safety" element={<SafetyFire />} />
              <Route path="/parking" element={<ParkingManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
