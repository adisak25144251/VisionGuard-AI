
import React from 'react';
import { EyeOff } from 'lucide-react';
import { VisionBox } from '../services/edgeVision';

interface PrivacyMaskLayerProps {
  active: boolean;
  type: 'FACE' | 'PLATE' | 'BOTH';
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  boxes?: VisionBox[];
}

const PrivacyMaskLayer: React.FC<PrivacyMaskLayerProps> = ({ active, type, userRole, boxes = [] }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {(type === 'FACE' || type === 'PLATE' || type === 'BOTH') && boxes.map(box => (
        <div
          key={box.id}
          className="absolute rounded-md backdrop-blur-xl bg-black/45 border border-white/20 flex items-center justify-center"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`
          }}
        >
          <div className="flex flex-col items-center gap-1 text-white/70">
            <EyeOff size={14} />
            <span className="text-[8px] tracking-widest font-mono">REDACTED</span>
          </div>
        </div>
      ))}
      
      {userRole === 'VIEWER' && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-15deg]">
            <span className="text-6xl font-bold text-white whitespace-nowrap">VIEWER MODE • RESTRICTED</span>
         </div>
      )}
    </div>
  );
};

export default PrivacyMaskLayer;
