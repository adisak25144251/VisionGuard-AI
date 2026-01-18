
import React from 'react';
import { EyeOff } from 'lucide-react';

interface PrivacyMaskLayerProps {
  active: boolean;
  type: 'FACE' | 'PLATE' | 'BOTH';
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

const PrivacyMaskLayer: React.FC<PrivacyMaskLayerProps> = ({ active, type, userRole }) => {
  if (!active) return null;

  // Mock positions for demo - normally these come from the detection engine (bounding boxes)
  // We use CSS blur backdrop-filter to simulate
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Simulation of Face Blurs */}
      {(type === 'FACE' || type === 'BOTH') && (
        <>
          <div className="absolute top-[20%] left-[40%] w-12 h-16 rounded-full backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center">
             <EyeOff size={12} className="text-white/50" />
          </div>
          <div className="absolute top-[30%] left-[10%] w-10 h-14 rounded-full backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center">
             <EyeOff size={12} className="text-white/50" />
          </div>
        </>
      )}

      {/* Simulation of Plate Blurs */}
      {(type === 'PLATE' || type === 'BOTH') && (
        <div className="absolute bottom-[20%] right-[30%] w-24 h-8 rounded bg-black/50 backdrop-blur-lg flex items-center justify-center border border-white/20">
           <span className="text-[8px] text-white/70 tracking-widest font-mono">CONFIDENTIAL</span>
        </div>
      )}
      
      {/* Watermark for Viewers */}
      {userRole === 'VIEWER' && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-15deg]">
            <span className="text-6xl font-bold text-white whitespace-nowrap">VIEWER MODE • RESTRICTED</span>
         </div>
      )}
    </div>
  );
};

export default PrivacyMaskLayer;
