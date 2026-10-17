/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import avatarImg from '../assets/images/Gk blazer.jpeg';

interface PixelLaunchIntroProps {
  onComplete?: () => void;
}

interface Particle {
  startX: number;
  startY: number;
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  c: string;
  delay: number;
  wanderAngle: number;
}

export default function PixelLaunchIntro({ onComplete }: PixelLaunchIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [percent, setPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('assembling world… 0%');
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  // References for animation state
  const isTerminatedRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  const finishIntro = useCallback((instant: boolean = false) => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;

    if (instant) {
      setIsDone(true);
      onComplete?.();
    } else {
      setStatusText('entering…');
      setIsExiting(true);
      setTimeout(() => {
        setIsDone(true);
        onComplete?.();
      }, 700);
    }
  }, [onComplete]);

  useEffect(() => {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishIntro(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const S = 360;
    const PX = 8;
    const GRID = Math.floor(S / PX);

    let parts: Particle[] | null = null;
    let exploding = false;

    // Load Gokul's image
    const img = new Image();
    img.src = avatarImg;

    const readPixels = (loadedImg: HTMLImageElement, size: number) => {
      try {
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        if (!octx) return null;

        // Crop square focusing on portrait face and torso
        const cropW = loadedImg.naturalWidth || loadedImg.width;
        const cropH = loadedImg.naturalHeight || loadedImg.height;
        const cropSize = Math.min(cropW, cropH);
        const sx = (cropW - cropSize) / 2;
        const sy = 0; // top-align portrait

        octx.drawImage(loadedImg, sx, sy, cropSize, cropSize, 0, 0, size, size);
        return octx.getImageData(0, 0, size, size).data;
      } catch (err) {
        console.warn('Canvas pixel extraction fallback:', err);
        return null;
      }
    };

    const buildParticles = (loadedImg: HTMLImageElement) => {
      const data = readPixels(loadedImg, GRID);
      if (!data) return false;

      // Sample top-left and top-right corner to detect background color
      const iTL = 0;
      const bgR = data[iTL];
      const bgG = data[iTL + 1];
      const bgB = data[iTL + 2];

      const newParts: Particle[] = [];

      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = (y * GRID + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 80) continue;

          // Skip pure white/bright background
          const brightness = (r + g + b) / 3;
          if (brightness > 245) continue;

          // Check distance to corner background color
          const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);
          if (colorDist < 28 && (y < GRID * 0.35 || x < GRID * 0.15 || x > GRID * 0.85)) {
            // Likely background edge
            continue;
          }

          const angle = Math.random() * Math.PI * 2;
          const radius = S * (0.85 + Math.random() * 0.95);
          const startX = S / 2 + Math.cos(angle) * radius;
          const startY = S / 2 + Math.sin(angle) * radius;

          newParts.push({
            startX,
            startY,
            x: startX,
            y: startY,
            hx: x * PX + PX / 2,
            hy: y * PX + PX / 2,
            vx: 0,
            vy: 0,
            c: `rgb(${r},${g},${b})`,
            delay: Math.random() * 700, // staggered start up to 700ms
            wanderAngle: Math.random() * Math.PI * 2,
          });
        }
      }

      // If filtering was overly aggressive, use all non-white pixels
      if (newParts.length < 120) {
        newParts.length = 0;
        for (let y = 0; y < GRID; y++) {
          for (let x = 0; x < GRID; x++) {
            const i = (y * GRID + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 80 || (r + g + b) / 3 > 248) continue;

            const angle = Math.random() * Math.PI * 2;
            const radius = S * (0.85 + Math.random() * 0.95);
            const startX = S / 2 + Math.cos(angle) * radius;
            const startY = S / 2 + Math.sin(angle) * radius;

            newParts.push({
              startX,
              startY,
              x: startX,
              y: startY,
              hx: x * PX + PX / 2,
              hy: y * PX + PX / 2,
              vx: 0,
              vy: 0,
              c: `rgb(${r},${g},${b})`,
              delay: Math.random() * 700,
              wanderAngle: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      parts = newParts;
      return true;
    };

    let imgLoaded = false;
    img.onload = () => {
      imgLoaded = true;
      buildParticles(img);
    };
    img.onerror = () => {
      // If photo fails, skip intro safely
      finishIntro(true);
    };

    // 4-second total choreography
    const ASSEMBLY_MS = 2800; // ~2.8s smooth convergence (0% -> 100%)
    const PAUSE_MS = 400;     // ~0.4s pause showing completed pixel portrait
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (isTerminatedRef.current) return;

      if (!imgLoaded) {
        animFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!parts || parts.length === 0) {
        finishIntro(true);
        return;
      }

      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime;
      ctx.clearRect(0, 0, S, S);

      if (elapsed < ASSEMBLY_MS) {
        // Phase 1 (0 to 2.8s): Smooth Assembly
        const pct = Math.min(100, Math.floor((elapsed / ASSEMBLY_MS) * 100));
        setPercent(pct);
        setStatusText(`assembling world… ${pct}%`);

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const partElapsed = Math.max(0, elapsed - p.delay);
          const totalPartTime = Math.max(1, ASSEMBLY_MS - p.delay);
          const progress = Math.min(1, partElapsed / totalPartTime);

          // Smooth cubic ease-out
          const ease = 1 - Math.pow(1 - progress, 3);
          // Gentle floating wander that settles as it approaches target
          const wander = (1 - ease) * Math.sin(elapsed * 0.005 + p.wanderAngle) * 6;

          p.x = p.startX + (p.hx - p.startX) * ease + wander;
          p.y = p.startY + (p.hy - p.startY) * ease + wander;

          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - PX / 2, p.y - PX / 2, PX - 1, PX - 1);
        }
      } else if (elapsed < ASSEMBLY_MS + PAUSE_MS) {
        // Phase 2 (2.8s to 3.2s): Fully Assembled Display
        setPercent(100);
        setStatusText('assembling world… 100%');

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.x = p.hx;
          p.y = p.hy;
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - PX / 2, p.y - PX / 2, PX - 1, PX - 1);
        }
      } else {
        // Phase 3 (3.2s+): Explosion Burst & Smooth Exit Transition
        if (!exploding) {
          exploding = true;
          setStatusText('entering…');
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            const dx = p.x - S / 2;
            const dy = p.y - S / 2;
            const d = Math.hypot(dx, dy) || 1;
            const speed = 5 + Math.random() * 9;
            p.vx = (dx / d) * speed;
            p.vy = (dy / d) * speed - 1.5;
          }

          // Trigger smooth fade-out
          setTimeout(() => {
            finishIntro(false);
          }, 350);
        }

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gentle downward gravity
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - PX / 2, p.y - PX / 2, PX - 1, PX - 1);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    // Fail-safe timeout: never hold page hostage
    const safetyTimer = setTimeout(() => {
      finishIntro(true);
    }, 8000);

    return () => {
      clearTimeout(safetyTimer);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [finishIntro]);

  if (isDone) return null;

  return (
    <aside
      aria-label="Portfolio Loading Screen"
      onClick={() => finishIntro(false)}
      className={`fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center gap-5 md:gap-6 cursor-pointer select-none transition-opacity duration-700 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Pixel Portrait Canvas */}
      <div className="relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] aspect-square block"
        />
      </div>

      {/* Intro Name */}
      <h1 className="font-serif-intro italic text-3xl sm:text-4xl text-[#2b2b2b] tracking-wide m-0 font-normal">
        gokul ramesh
      </h1>

      {/* Progress Status */}
      <div className="font-mono-intro text-xs sm:text-[13px] text-[#8a8a8a] tracking-[0.14em]">
        {statusText}
      </div>

      {/* Skip Hint */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro(false);
        }}
        className="font-mono-intro text-[11px] text-[#b4b4b4] hover:text-[#555555] transition-colors mt-1 underline underline-offset-4 cursor-pointer bg-transparent border-none p-1"
      >
        click to skip
      </button>
    </aside>
  );
}
