'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CONSTELLATIONS } from '@/lib/constellations';

interface ConstellationCanvasProps {
  sign: string;
  width?: number;
  height?: number;
  animated?: boolean;
  clickable?: boolean; // enable fullscreen on click
  onStarClick?: (starName: string, sign: string) => void;
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  sign: string,
  width: number,
  height: number,
  animated: boolean,
  time: number
) {
  const constellation = CONSTELLATIONS[sign];
  if (!constellation) return;

  // Deep space background gradient
  const bg = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  bg.addColorStop(0, '#0f1b3d');
  bg.addColorStop(0.5, '#080e22');
  bg.addColorStop(1, '#020509');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Background dim star field (deterministic from sign name)
  const seed = sign.charCodeAt(0) * 31 + sign.charCodeAt(1) * 17;
  for (let i = 0; i < 80; i++) {
    const sx = ((seed * (i + 7) * 17 + i * 53) % 97) / 97 * width;
    const sy = ((seed * (i + 3) * 31 + i * 77) % 89) / 89 * height;
    const sr = 0.2 + ((seed * i * 13) % 100) / 100 * 0.9;
    const flicker = animated ? 0.3 + 0.4 * Math.sin(time * 1.2 + i * 0.7) : 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(170,200,255,${flicker * 0.4})`;
    ctx.fill();
  }

  // Map star positions from 0-100 coordinate space to canvas
  const stars = constellation.stars.map((star) => ({
    ...star,
    px: (star.x / 100) * width,
    py: (star.y / 100) * height,
  }));

  // Draw constellation lines
  constellation.lines.forEach(([a, b]) => {
    const sa = stars[a];
    const sb = stars[b];
    const shimmer = animated
      ? 0.3 + 0.2 * Math.sin(time * 0.8 + (sa.px + sb.px) * 0.01)
      : 0.4;

    ctx.beginPath();
    ctx.moveTo(sa.px, sa.py);
    ctx.lineTo(sb.px, sb.py);

    const lineGrad = ctx.createLinearGradient(sa.px, sa.py, sb.px, sb.py);
    lineGrad.addColorStop(0, `rgba(147,197,253,${shimmer})`);
    lineGrad.addColorStop(0.5, `rgba(196,181,253,${shimmer + 0.15})`);
    lineGrad.addColorStop(1, `rgba(147,197,253,${shimmer})`);

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = width > 400 ? 1.2 : 0.8;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(147,197,253,0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Draw stars
  stars.forEach((star) => {
    const radius = Math.max(1.2, (6 - star.magnitude) * (width > 400 ? 1.5 : 0.9) + 1);
    const glow = animated
      ? 0.6 + 0.4 * Math.sin(time * 2 + star.px * 0.05 + star.py * 0.03)
      : 0.85;

    // Outer halo
    const halo = ctx.createRadialGradient(star.px, star.py, 0, star.px, star.py, radius * 4);
    halo.addColorStop(0, `rgba(220,235,255,${glow * 0.5})`);
    halo.addColorStop(0.4, `rgba(147,197,253,${glow * 0.2})`);
    halo.addColorStop(1, 'rgba(147,197,253,0)');
    ctx.beginPath();
    ctx.arc(star.px, star.py, radius * 4, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Star core
    const core = ctx.createRadialGradient(star.px, star.py, 0, star.px, star.py, radius);
    core.addColorStop(0, `rgba(255,255,255,${glow})`);
    core.addColorStop(0.5, `rgba(210,225,255,${glow * 0.9})`);
    core.addColorStop(1, `rgba(147,197,253,${glow * 0.3})`);
    ctx.beginPath();
    ctx.arc(star.px, star.py, radius, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    // Label for named bright stars
    if (star.isNamed && star.magnitude <= 3) {
      const fontSize = width > 400 ? 11 : 9;
      ctx.font = `${fontSize}px 'Cinzel', serif`;
      ctx.fillStyle = `rgba(196,181,253,${0.65 + glow * 0.3})`;
      ctx.textAlign = 'left';
      const labelX = Math.min(star.px + radius + 4, width - 60);
      ctx.fillText(star.name.split('(')[0].trim(), labelX, star.py - 3);
    }
  });
}

// ─── Standalone canvas hook ───────────────────────────────────────────────────
function useConstellationCanvas(
  sign: string,
  width: number,
  height: number,
  animated: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    let startTime: number | null = null;

    function render(ts: number) {
      if (!ctx) return;
      if (startTime === null) startTime = ts;
      const time = (ts - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);
      drawConstellation(ctx, sign, width, height, animated, time);
      if (animated) animFrameRef.current = requestAnimationFrame(render);
    }

    if (animated) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      drawConstellation(ctx, sign, width, height, false, 0);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    };
  }, [sign, width, height, animated]);

  return canvasRef;
}

// ─── Fullscreen Modal ─────────────────────────────────────────────────────────
function FullscreenModal({ sign, onClose }: { sign: string; onClose: () => void }) {
  const [dims, setDims] = useState({ w: 800, h: 500 });

  useEffect(() => {
    function updateDims() {
      setDims({ w: window.innerWidth, h: window.innerHeight });
    }
    updateDims();
    window.addEventListener('resize', updateDims);
    // Prevent scroll behind modal
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', updateDims);
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canvasRef = useConstellationCanvas(sign, dims.w, dims.h - 60, true);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-silver/50">Constellation</p>
          <h2 className="font-display text-xl text-gold capitalize">{sign}</h2>
        </div>
        <button
          id="constellation-fullscreen-close"
          onClick={onClose}
          aria-label="Close fullscreen"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Full canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: dims.w, height: dims.h - 60 }}
          aria-label={`${sign} constellation fullscreen`}
        />
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function ConstellationCanvas({
  sign,
  width = 300,
  height = 200,
  animated = true,
  clickable = false,
  onStarClick,
}: ConstellationCanvasProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const canvasRef = useConstellationCanvas(sign, width, height, animated);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (onStarClick) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const x = (e.clientX - rect.left) * scaleX / dpr;
      const y = (e.clientY - rect.top) * scaleY / dpr;

      const constellation = CONSTELLATIONS[sign];
      if (constellation) {
        for (const star of constellation.stars) {
          if (!star.isNamed || star.magnitude > 3) continue;
          
          const px = (star.x / 100) * width;
          const py = (star.y / 100) * height;
          
          const radius = Math.max(1.2, (6 - star.magnitude) * (width > 400 ? 1.5 : 0.9) + 1);
          const clickRadius = radius * 4 + 15;

          const dist = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
          if (dist <= clickRadius) {
            e.stopPropagation();
            onStarClick(star.name, sign);
            return;
          }
        }
      }
    }

    if (clickable) {
      e.stopPropagation();
      setShowFullscreen(true);
    }
  }, [clickable, sign, width, height, onStarClick, canvasRef]);

  return (
    <>
      <div
        className="relative"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          className={`block h-full w-full rounded-xl ${(clickable || onStarClick) ? 'cursor-pointer transition-opacity hover:opacity-90' : ''}`}
          style={{ width: '100%', height: '100%' }}
          onClick={handleClick}
          title={clickable ? 'Click to view fullscreen' : undefined}
          aria-label={`${sign} constellation`}
        />
        {clickable && (
          <div
            className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Expand
          </div>
        )}
      </div>

      {showFullscreen && (
        <FullscreenModal sign={sign} onClose={() => setShowFullscreen(false)} />
      )}
    </>
  );
}
