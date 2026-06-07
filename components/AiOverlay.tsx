import React, { useRef, useEffect } from 'react';
import { VisionBox } from '../services/edgeVision';

interface AiOverlayProps {
  active: boolean;
  showLanes: boolean;
  showFence: boolean;
  boxes?: VisionBox[];
}

const AiOverlay: React.FC<AiOverlayProps> = ({ active, showLanes, showFence, boxes = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Resize handling
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!active) return;

      // Draw Lanes
      if (showLanes) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        
        // Left Lane
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.4);
        ctx.stroke();

        // Right Lane
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.8, canvas.height);
        ctx.lineTo(canvas.width * 0.6, canvas.height * 0.4);
        ctx.stroke();

        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText('LANE 01', canvas.width * 0.25, canvas.height - 20);
        ctx.fillText('LANE 02', canvas.width * 0.70, canvas.height - 20);
      }

      // Draw Virtual Fence
      if (showFence) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        
        ctx.beginPath();
        ctx.moveTo(10, canvas.height - 10);
        ctx.lineTo(10, 10);
        ctx.lineTo(canvas.width * 0.3, 10);
        ctx.lineTo(canvas.width * 0.3, canvas.height - 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.fillText('RESTRICTED ZONE', 20, 30);
      }

      boxes.forEach(box => {
        const x = (box.x / 100) * canvas.width;
        const y = (box.y / 100) * canvas.height;
        const w = (box.w / 100) * canvas.width;
        const h = (box.h / 100) * canvas.height;
        const label = `${box.label} ${Math.round(box.confidence * 100)}%`;

        ctx.strokeStyle = box.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = box.color;
        ctx.font = 'bold 12px Inter';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x, Math.max(0, y - 20), textWidth + 10, 20);

        ctx.fillStyle = '#000';
        ctx.fillText(label, x + 5, Math.max(14, y - 6));

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 10, y);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [active, showLanes, showFence, boxes]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default AiOverlay;
