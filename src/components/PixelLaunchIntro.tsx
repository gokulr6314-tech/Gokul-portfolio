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
  const boxRef = useRef<HTMLDivElement | null>(null);
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

    // Resize canvas to full window
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const handleResize = () => {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    // Higher density grid (96x96) produces small, crisp micro-pixels for clear facial definition
    const GRID = 96;
    let pxSize = 3.5;
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

      // Get target box coordinates on the screen
      const boxRect = boxRef.current?.getBoundingClientRect();
      const targetBoxW = boxRect ? boxRect.width : Math.min(340, W * 0.85);
      const targetBoxH = boxRect ? boxRect.height : targetBoxW;
      const targetLeft = boxRect ? boxRect.left : (W - targetBoxW) / 2;
      const targetTop = boxRect ? boxRect.top : (H - targetBoxH) / 2 - 40;

      pxSize = targetBoxW / GRID;

      const centerX = W / 2;
      const centerY = H / 2;

      // Sample top corner to detect background
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

          // Check distance to corner background color near outer edges
          const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);
          if (colorDist < 28 && (y < GRID * 0.35 || x < GRID * 0.15 || x > GRID * 0.85)) {
            continue;
          }

          // Target position strictly inside the designated box
          const hx = targetLeft + x * pxSize + pxSize / 2;
          const hy = targetTop + y * pxSize + pxSize / 2;

          // Start position spread across the entire screen and beyond screen boundaries
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.max(W, H) * (0.55 + Math.random() * 0.75);
          const startX = centerX + Math.cos(angle) * distance;
          const startY = centerY + Math.sin(angle) * distance;

          newParts.push({
            startX,
            startY,
            x: startX,
            y: startY,
            hx,
            hy,
            vx: 0,
            vy: 0,
            c: `rgb(${r},${g},${b})`,
            delay: Math.random() * 750, // staggered start
            wanderAngle: Math.random() * Math.PI * 2,
          });
        }
      }

      // Fallback if filtering was too aggressive
      if (newParts.length < 500) {
        newParts.length = 0;
        for (let y = 0; y < GRID; y++) {
          for (let x = 0; x < GRID; x++) {
            const i = (y * GRID + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 80 || (r + g + b) / 3 > 248) continue;

            const hx = targetLeft + x * pxSize + pxSize / 2;
            const hy = targetTop + y * pxSize + pxSize / 2;

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.max(W, H) * (0.55 + Math.random() * 0.75);
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;

            newParts.push({
              startX,
              startY,
              x: startX,
              y: startY,
              hx,
              hy,
              vx: 0,
              vy: 0,
              c: `rgb(${r},${g},${b})`,
              delay: Math.random() * 750,
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
      finishIntro(true);
    };

    // 4-second total choreography
    const ASSEMBLY_MS = 2800; // ~2.8s smooth convergence across screen into box
    const PAUSE_MS = 400;     // ~0.4s pause showing completed pixel portrait in box
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
      ctx.clearRect(0, 0, W, H);

      const drawGap = pxSize > 5 ? 0.7 : Math.max(0.25, pxSize * 0.08);
      const drawSize = Math.max(1, pxSize - drawGap);

      if (elapsed < ASSEMBLY_MS) {
        // Phase 1 (0 to 2.8s): Convergence from full screen into the box
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
          // Gentle floating wander that diminishes as particle settles into the box
          const wander = (1 - ease) * Math.sin(elapsed * 0.005 + p.wanderAngle) * 8;

          p.x = p.startX + (p.hx - p.startX) * ease + wander;
          p.y = p.startY + (p.hy - p.startY) * ease + wander;

          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - pxSize / 2, p.y - pxSize / 2, drawSize, drawSize);
        }
      } else if (elapsed < ASSEMBLY_MS + PAUSE_MS) {
        // Phase 2 (2.8s to 3.2s): Fully Assembled Pixel Portrait in the Box
        setPercent(100);
        setStatusText('assembling world… 100%');

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.x = p.hx;
          p.y = p.hy;
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - pxSize / 2, p.y - pxSize / 2, drawSize, drawSize);
        }
      } else {
        // Phase 3 (3.2s+): Full-screen Explosion Burst outward
        if (!exploding) {
          exploding = true;
          setStatusText('entering…');
          const centerX = W / 2;
          const centerY = H / 2;

          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const d = Math.hypot(dx, dy) || 1;
            const speed = 12 + Math.random() * 20; // fast burst across full viewport
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
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - pxSize / 2, p.y - pxSize / 2, drawSize, drawSize);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    // Fail-safe timeout
    const safetyTimer = setTimeout(() => {
      finishIntro(true);
    }, 8000);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      className={`fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-700 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Full-Screen Canvas covering entire viewport */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Center Target Box: defines the portrait area */}
      <div
        ref={boxRef}
        className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[350px] md:h-[350px] relative pointer-events-none z-10"
      />

      {/* Details sitting below the final pixel image box */}
      <div className="relative z-20 flex flex-col items-center gap-3 mt-6 pointer-events-auto">
        <h1 className="font-serif-intro italic text-3xl sm:text-4xl text-[#2b2b2b] tracking-wide m-0 font-normal">
          gokul ramesh
        </h1>

        <div className="font-mono-intro text-xs sm:text-[13px] text-[#8a8a8a] tracking-[0.14em]">
          {statusText}
        </div>

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
      </div>
    </aside>
  );
}
