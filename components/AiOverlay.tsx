import React, { useRef, useEffect } from 'react';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  dx: number;
  dy: number;
}

interface AiOverlayProps {
  active: boolean;
  showLanes: boolean;
  showFence: boolean;
}

const AiOverlay: React.FC<AiOverlayProps> = ({ active, showLanes, showFence }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxesRef = useRef<Box[]>([]);

  useEffect(() => {
    // Initialize mock boxes
    boxesRef.current = [
      { x: 50, y: 100, w: 60, h: 120, label: 'Person 98%', color: '#22d3ee', dx: 0.5, dy: 0.2 },
      { x: 200, y: 150, w: 140, h: 80, label: 'Car 95%', color: '#818cf8', dx: -0.8, dy: 0 },
    ];
  }, []);

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

      // Draw & Update Boxes
      boxesRef.current.forEach(box => {
        // Update position
        box.x += box.dx;
        box.y += box.dy;

        // Bounce
        if (box.x <= 0 || box.x + box.w >= canvas.width) box.dx *= -1;
        if (box.y <= 0 || box.y + box.h >= canvas.height) box.dy *= -1;

        // Draw Box
        ctx.strokeStyle = box.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Draw Label Background
        ctx.fillStyle = box.color;
        const textWidth = ctx.measureText(box.label).width;
        ctx.fillRect(box.x, box.y - 20, textWidth + 10, 20);

        // Draw Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Inter';
        ctx.fillText(box.label, box.x + 5, box.y - 6);

        // Corner accents
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + 10);
        ctx.lineTo(box.x, box.y);
        ctx.lineTo(box.x + 10, box.y);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [active, showLanes, showFence]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default AiOverlay;
