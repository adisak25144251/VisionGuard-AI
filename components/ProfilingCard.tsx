
import React from 'react';
import { 
  User, Car, Box, AlertTriangle, ShieldAlert, Fingerprint, 
  Activity, MapPin, Clock, Search, ExternalLink, HelpCircle
} from 'lucide-react';
import { SuspectProfile, ProfileAttribute } from '../types';

interface ProfilingCardProps {
  profile: SuspectProfile;
  onAction?: (action: string) => void;
}

const AttributeRow: React.FC<{ attr: ProfileAttribute }> = ({ attr }) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800 last:border-0">
    <span className="text-slate-400">{attr.label}</span>
    <div className="text-right">
      <div className="text-slate-200 font-medium">{attr.value}</div>
      <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 ml-auto overflow-hidden">
        <div 
          className="h-full bg-cyan-500" 
          style={{ width: `${attr.confidence * 100}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const ProfilingCard: React.FC<ProfilingCardProps> = ({ profile, onAction }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User size={20} />;
      case 'VEHICLE': return <Car size={20} />;
      default: return <Box size={20} />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl w-80 animate-fade-in">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white font-bold">
          <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
            {getTypeIcon(profile.type)}
          </div>
          <span className="text-sm">Target Profile</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getRiskColor(profile.riskLevel)}`}>
          {profile.riskLevel}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Identity Block */}
        <div className="flex gap-4">
          <div className="relative w-20 h-24 bg-black rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
            <img src={profile.snapshotUrl} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
              ID: {profile.id.slice(-4)}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            {/* Risk Gauge */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Risk Score</span>
                <span className={`font-bold ${profile.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{profile.riskScore}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${getRiskColor(profile.riskLevel)}`} 
                  style={{ width: `${profile.riskScore}%` }}
                ></div>
              </div>
            </div>

            {/* Identity Match */}
            {profile.identityMatch ? (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-2 text-xs">
                <div className="flex items-center gap-1 text-red-400 font-bold mb-1">
                  <Fingerprint size={12} /> {profile.identityMatch.category}
                </div>
                <div className="text-white truncate">{profile.identityMatch.name}</div>
                <div className="text-[10px] text-red-300">Match: {(profile.identityMatch.similarity * 100).toFixed(1)}%</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <HelpCircle size={12} /> Unknown Identity
              </div>
            )}
          </div>
        </div>

        {/* Attributes Section */}
        <div className="space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
            <h4 className="text-[10px] font-bold text-primary-400 uppercase mb-2 flex items-center gap-1">
              <Activity size={10} /> Physical Attributes
            </h4>
            {profile.basicAttributes.map((attr, i) => <AttributeRow key={i} attr={attr} />)}
          </div>

          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
            <h4 className="text-[10px] font-bold text-yellow-400 uppercase mb-2 flex items-center gap-1">
              <ShieldAlert size={10} /> Appearance & Action
            </h4>
            {profile.appearanceAttributes.map((attr, i) => <AttributeRow key={i} attr={attr} />)}
            {profile.actionAttributes.map((attr, i) => <AttributeRow key={i} attr={attr} />)}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
           <button 
             onClick={() => onAction && onAction('TRACK')}
             className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-600 flex items-center justify-center gap-1"
           >
             <MapPin size={12} /> Track
           </button>
           <button 
             onClick={() => onAction && onAction('REPORT')}
             className="py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded text-xs font-bold shadow flex items-center justify-center gap-1"
           >
             <ExternalLink size={12} /> Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilingCard;
