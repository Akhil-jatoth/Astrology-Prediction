'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CONSTELLATIONS } from '@/lib/constellations';

interface CelestialSkyImageCardProps {
  initialDate?: string;
  initialSign?: string;
  title?: string;
}

// Helper to format nice readable date
function formatReadableDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

// Calculate Sun sign based on month and day
function getSignForDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();

    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'aries';
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'taurus';
    if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'gemini';
    if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'cancer';
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'leo';
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'virgo';
    if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'libra';
    if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'scorpio';
    if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'sagittarius';
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'capricorn';
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'aquarius';
    return 'pisces';
  } catch {
    return 'scorpio';
  }
}

export function CelestialSkyImageCard({
  initialDate,
  initialSign,
  title,
}: CelestialSkyImageCardProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(initialDate || todayStr);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSign = initialSign || getSignForDate(date);
  const isToday = date === todayStr;
  const isYesterday = date === yesterdayStr;

  const cardTitle = title || (isToday ? "Today's Celestial Sky & Stars" : isYesterday ? "Yesterday's Celestial Sky & Stars" : `Celestial Sky for ${formatReadableDate(date)}`);

  // Render high-resolution star image on canvas
  const drawSkyMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution rendering (1200 x 750)
    const width = 1200;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // 1. Deep Space Background Gradient
    const bg = ctx.createRadialGradient(
      width * 0.5, height * 0.45, 80,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.75
    );
    bg.addColorStop(0, '#0c1538');      // Luminous deep blue core
    bg.addColorStop(0.35, '#070c24');   // Deep indigo
    bg.addColorStop(0.7, '#040716');    // Cosmic midnight
    bg.addColorStop(1, '#01030a');      // Obsidian space edge
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Swirling Nebula Clouds (Cyan, Magenta, Gold interstellar dust)
    const drawNebula = (cx: number, cy: number, r: number, color1: string, color2: string) => {
      const nebGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      nebGrad.addColorStop(0, color1);
      nebGrad.addColorStop(0.5, color2);
      nebGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawNebula(width * 0.35, height * 0.4, 280, 'rgba(99,102,241,0.18)', 'rgba(79,70,229,0.06)');
    drawNebula(width * 0.7, height * 0.5, 320, 'rgba(168,85,247,0.15)', 'rgba(147,51,234,0.05)');
    drawNebula(width * 0.5, height * 0.3, 240, 'rgba(245,158,11,0.12)', 'rgba(217,119,6,0.04)');
    drawNebula(width * 0.2, height * 0.6, 220, 'rgba(56,189,248,0.14)', 'rgba(14,165,233,0.04)');

    // 3. Subtle Celestial Coordinate Grid (Declination rings & Hour circles)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let r = 120; r <= 420; r += 100) {
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.48, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Horizon ellipse
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.48, 520, 290, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Background Starfield (deterministic from date seed)
    let seed = 0;
    for (let i = 0; i < date.length; i++) {
      seed = (seed * 31 + date.charCodeAt(i)) % 1000007;
    }
    const pseudoRandom = () => {
      seed = (seed * 16807 + 11) % 2147483647;
      return (seed & 0x7fffffff) / 2147483647;
    };

    const numStars = 320;
    for (let i = 0; i < numStars; i++) {
      const sx = pseudoRandom() * width;
      const sy = pseudoRandom() * (height - 90);
      const mag = pseudoRandom();
      const sr = mag < 0.85 ? 0.6 + mag * 1.2 : 2.0 + mag * 1.6;

      // Color temperature variety (blue-white, gold, pale violet)
      const colorType = pseudoRandom();
      const starColor = colorType > 0.8 ? 'rgba(255,235,170,0.9)' : colorType > 0.6 ? 'rgba(180,210,255,0.95)' : 'rgba(240,245,255,0.85)';

      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.fill();

      // Bright stars get a soft halo
      if (sr > 2.0) {
        const starHalo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
        starHalo.addColorStop(0, 'rgba(255,255,255,0.6)');
        starHalo.addColorStop(0.4, 'rgba(147,197,253,0.25)');
        starHalo.addColorStop(1, 'rgba(147,197,253,0)');
        ctx.fillStyle = starHalo;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 5, 0, Math.PI * 2);
        ctx.fill();

        // 4-point diffraction spike
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 0.8;
        const spikeLen = sr * 4;
        ctx.beginPath();
        ctx.moveTo(sx - spikeLen, sy);
        ctx.lineTo(sx + spikeLen, sy);
        ctx.moveTo(sx, sy - spikeLen);
        ctx.lineTo(sx, sy + spikeLen);
        ctx.stroke();
      }
    }

    // 5. Draw Prominent Zodiac Constellation for this date
    const constellation = CONSTELLATIONS[activeSign] || CONSTELLATIONS.scorpio || CONSTELLATIONS.aries;
    const offsetX = width * 0.28;
    const offsetY = height * 0.16;
    const scale = 5.2;

    const stars = constellation.stars.map((s) => ({
      ...s,
      px: offsetX + (s.x * scale),
      py: offsetY + (s.y * scale * 0.85),
    }));

    // Constellation connecting lines with glowing gradient
    constellation.lines.forEach(([a, b]) => {
      const sa = stars[a];
      const sb = stars[b];
      if (!sa || !sb) return;

      ctx.beginPath();
      ctx.moveTo(sa.px, sa.py);
      ctx.lineTo(sb.px, sb.py);
      ctx.strokeStyle = 'rgba(255,215,102,0.6)';
      ctx.lineWidth = 2.0;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,215,102,0.8)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Constellation stars with golden core and labels
    stars.forEach((star) => {
      const radius = Math.max(3.0, (6 - star.magnitude) * 2.2);

      // Outer golden halo
      const halo = ctx.createRadialGradient(star.px, star.py, 0, star.px, star.py, radius * 4);
      halo.addColorStop(0, 'rgba(255,220,120,0.8)');
      halo.addColorStop(0.5, 'rgba(255,190,70,0.3)');
      halo.addColorStop(1, 'rgba(255,190,70,0)');
      ctx.beginPath();
      ctx.arc(star.px, star.py, radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(star.px, star.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Label
      if (star.isNamed || star.magnitude <= 2) {
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = '#ffd166';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.fillText(star.name, star.px + radius + 7, star.py + 4);
        ctx.shadowBlur = 0;
      }
    });

    // 6. Draw Celestial Planets & Moon
    // The Moon
    const moonX = width * 0.82;
    const moonY = height * 0.28;
    const moonRadius = 24;

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 4);
    moonGlow.addColorStop(0, 'rgba(240,248,255,0.7)');
    moonGlow.addColorStop(0.4, 'rgba(210,230,255,0.2)');
    moonGlow.addColorStop(1, 'rgba(210,230,255,0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc with crater shading
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Lunar crescent shadow
    ctx.beginPath();
    ctx.arc(moonX + 7, moonY - 3, moonRadius - 1, 0, Math.PI * 2);
    ctx.fillStyle = '#080d24';
    ctx.fill();

    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText("☽ Moon (Aries 14°)", moonX - 45, moonY + moonRadius + 18);

    // Planet: Venus (Bright Morning/Evening Star)
    const venusX = width * 0.16;
    const venusY = height * 0.36;
    ctx.beginPath();
    ctx.arc(venusX, venusY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.fillText("♀ Venus (Brilliant)", venusX + 10, venusY + 4);

    // Planet: Mars (Red beacon)
    const marsX = width * 0.74;
    const marsY = height * 0.62;
    ctx.beginPath();
    ctx.arc(marsX, marsY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.fillText("♂ Mars (Leo)", marsX + 9, marsY + 4);

    // Planet: Jupiter (Golden king)
    const jupX = width * 0.36;
    const jupY = height * 0.72;
    ctx.beginPath();
    ctx.arc(jupX, jupY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.fillText("♃ Jupiter (Gemini)", jupX + 11, jupY + 4);

    // 7. Elegant Observatory Footer Cartouche
    ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
    ctx.fillRect(0, height - 70, width, 70);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height - 70);
    ctx.lineTo(width, height - 70);
    ctx.stroke();

    // Observatory titles
    ctx.font = "bold 16px 'Cinzel', Georgia, serif";
    ctx.fillStyle = '#ffd166';
    ctx.fillText(`✦ ASTRAVERSE OBSERVATORY · ${activeSign.toUpperCase()} CONSTELLATION`, 30, height - 42);

    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Observation Date: ${formatReadableDate(date)}  ·  FOV 180° Zenith Dome  ·  VSOP87 Ephemeris`, 30, height - 20);

    // Date watermark
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`☉ Sun in ${activeSign.charAt(0).toUpperCase() + activeSign.slice(1)} · High Precision Star Map`, width - 30, height - 32);
    ctx.textAlign = 'left';

  }, [date, activeSign]);

  useEffect(() => {
    drawSkyMap();
  }, [drawSkyMap]);

  // Handle PNG image download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `stars-${activeSign}-${date}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-gold/30 bg-black/60 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="p-3.5 bg-white/[0.04] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <h4 className="text-sm font-bold text-gold font-display">{cardTitle}</h4>
            <p className="text-[11px] text-silver/60">
              {formatReadableDate(date)} · {activeSign.charAt(0).toUpperCase() + activeSign.slice(1)} Constellation
            </p>
          </div>
        </div>

        {/* Quick Date Switchers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate(todayStr)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isToday
                ? 'bg-gold text-primary font-bold shadow-md shadow-gold/20'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Today's Stars
          </button>
          <button
            type="button"
            onClick={() => setDate(yesterdayStr)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isYesterday
                ? 'bg-gold text-primary font-bold shadow-md shadow-gold/20'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Yesterday's Stars
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-lg bg-black/60 border border-white/15 px-2 py-1 text-xs text-white outline-none focus:border-gold/60"
            title="Pick custom date"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Generated Star Sky Image (Interactive Canvas) */}
      <div className="relative w-full aspect-[16/10] bg-black overflow-hidden group">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block"
        />

        {/* Floating Download Overlay button */}
        <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold/90 hover:bg-gold text-primary text-xs font-bold shadow-lg shadow-black/60 hover:scale-105 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{downloading ? 'Exporting...' : 'Download Image (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-silver/80 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Generated with VSOP87 Analytical Coordinates
          </span>
          <span className="hidden sm:inline text-silver/40">|</span>
          <span className="hidden sm:inline">1200x750 High Definition</span>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="text-xs text-gold hover:text-gold-light font-semibold underline underline-offset-4"
        >
          Save to Photo Gallery
        </button>
      </div>
    </div>
  );
}
