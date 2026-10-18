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
  r: number;
  g: number;
  b: number;
  c: string;
  delay: number;
  wanderAngle: number;
  flickerSpeed: number;
  flickerPhase: number;
  isGlitchParticle: boolean;
  burstAngle: number;
  burstDist: number;
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
      }, 600);
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

    // High density grid for crisp micro-pixels
    const GRID = 96;
    let pxSize = 3.5;
    let parts: Particle[] | null = null;
    let exploding = false;
    let explosionStartTime: number | null = null;

    // Load portrait image
    const img = new Image();
    img.src = avatarImg;

    const readPixels = (loadedImg: HTMLImageElement, size: number) => {
      try {
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        if (!octx) return null;

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

      // Sample top corner to detect background color
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

          // Target home position strictly inside designated box
          const hx = targetLeft + x * pxSize + pxSize / 2;
          const hy = targetTop + y * pxSize + pxSize / 2;

          // Initial scattered position across and slightly beyond viewport
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.max(W, H) * (0.45 + Math.random() * 0.85);
          const startX = centerX + Math.cos(angle) * distance;
          const startY = centerY + Math.sin(angle) * distance;

          // Blast angle outward from portrait center for Phase 2 explosion
          const dx = hx - (targetLeft + targetBoxW / 2);
          const dy = hy - (targetTop + targetBoxH / 2);
          const baseAngle = Math.atan2(dy, dx);
          const burstAngle = baseAngle + (Math.random() - 0.5) * 0.55;
          const burstDist = Math.max(W, H) * (0.65 + Math.random() * 0.85);

          newParts.push({
            startX,
            startY,
            x: startX,
            y: startY,
            hx,
            hy,
            r,
            g,
            b,
            c: `rgb(${r},${g},${b})`,
            delay: Math.random() * 600, // staggered start
            wanderAngle: Math.random() * Math.PI * 2,
            flickerSpeed: 0.015 + Math.random() * 0.03,
            flickerPhase: Math.random() * Math.PI * 2,
            isGlitchParticle: Math.random() < 0.12,
            burstAngle,
            burstDist
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
            const distance = Math.max(W, H) * (0.45 + Math.random() * 0.85);
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;

            const dx = hx - (targetLeft + targetBoxW / 2);
            const dy = hy - (targetTop + targetBoxH / 2);
            const baseAngle = Math.atan2(dy, dx);
            const burstAngle = baseAngle + (Math.random() - 0.5) * 0.55;
            const burstDist = Math.max(W, H) * (0.65 + Math.random() * 0.85);

            newParts.push({
              startX,
              startY,
              x: startX,
              y: startY,
              hx,
              hy,
              r,
              g,
              b,
              c: `rgb(${r},${g},${b})`,
              delay: Math.random() * 600,
              wanderAngle: Math.random() * Math.PI * 2,
              flickerSpeed: 0.015 + Math.random() * 0.03,
              flickerPhase: Math.random() * Math.PI * 2,
              isGlitchParticle: Math.random() < 0.12,
              burstAngle,
              burstDist
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

    // Timing Configuration:
    // Phase 1 (0 to 2400ms): Flicker & Assemble (0% -> 100%)
    // Phase 2 (2400ms to 3050ms): Instant Explosive Transition with expo.out momentum
    const ASSEMBLY_MS = 2400;
    const EXPLOSION_MS = 650;
    let startTime: number | null = null;

    // Inertia-based easing (expo.out) for explosive velocity dissipation
    const easeExpoOut = (t: number): number => {
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

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
        // =========================================================================
        // 1. The Flicker & Assemble Phase
        // =========================================================================
        const globalProgress = Math.min(1, elapsed / ASSEMBLY_MS);
        const pct = Math.min(100, Math.floor(globalProgress * 100));
        setPercent(pct);
        setStatusText(`assembling world… ${pct}%`);

        // Glitch pulse frequency: high at start, diminishing smoothly as face forms
        const glitchDecay = Math.max(0, 1 - globalProgress * 1.25);
        const isGlobalGlitchBeat = glitchDecay > 0.1 && (Math.floor(elapsed / 160) % 4 === 0);

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const partElapsed = Math.max(0, elapsed - p.delay);
          const totalPartTime = Math.max(1, ASSEMBLY_MS - p.delay);
          const progress = Math.min(1, partElapsed / totalPartTime);

          // Smooth cubic ease-out into portrait coordinates
          const ease = 1 - Math.pow(1 - progress, 3);
          
          // Gentle floating wander that diminishes as particle locks in
          const wander = (1 - ease) * Math.sin(elapsed * 0.006 + p.wanderAngle) * 7;

          p.x = p.startX + (p.hx - p.startX) * ease + wander;
          p.y = p.startY + (p.hy - p.startY) * ease + wander;

          // High-frequency flicker: variable opacity pulsing
          let alpha = 1;
          if (glitchDecay > 0.05) {
            const flickerWave = Math.sin(now * p.flickerSpeed + p.flickerPhase);
            // Blend from flickering (0.25 - 1.0) into solid 1.0 as progress -> 1
            const rawFlicker = 0.35 + 0.65 * Math.abs(flickerWave);
            alpha = rawFlicker * glitchDecay + 1.0 * (1 - glitchDecay);
          }
          ctx.globalAlpha = Math.min(1, Math.max(0.15, alpha));

          // Subtle chromatic aberration / neon-monochrome glitch
          let drawX = p.x - pxSize / 2;
          let drawY = p.y - pxSize / 2;

          if (glitchDecay > 0.15 && (p.isGlitchParticle || isGlobalGlitchBeat) && Math.random() < 0.22) {
            // Subtle horizontal micro-jitter
            const jitterX = (Math.random() - 0.5) * 4 * glitchDecay;
            drawX += jitterX;

            // Chromatic aberration split (cyan / magenta glint)
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 245, 255, 0.9)' : 'rgba(255, 0, 128, 0.9)';
            ctx.fillRect(drawX - 1.2, drawY, drawSize, drawSize);
            ctx.fillStyle = p.c;
            ctx.fillRect(drawX + 1.2, drawY, drawSize, drawSize);
          } else {
            ctx.fillStyle = p.c;
            ctx.fillRect(drawX, drawY, drawSize, drawSize);
          }
        }
      } else {
        // =========================================================================
        // 2. The Explosive Transition Phase (Triggered Exactly at 100%)
        // =========================================================================
        if (!exploding) {
          exploding = true;
          explosionStartTime = now;
          setPercent(100);
          setStatusText('assembling world… 100%');
          // Trigger immediate seamless dashboard reveal
          setIsExiting(true);
        }

        const explosionElapsed = now - (explosionStartTime ?? now);
        const tNorm = Math.min(1, explosionElapsed / EXPLOSION_MS);
        const ease = easeExpoOut(tNorm);

        // Inertia-based momentum burst outward and smooth dissipation
        const dissolveAlpha = Math.max(0, 1 - Math.pow(tNorm, 1.4));
        ctx.globalAlpha = dissolveAlpha;

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          // Sweeping momentum outward along calculated burst trajectories
          p.x = p.hx + Math.cos(p.burstAngle) * p.burstDist * ease;
          p.y = p.hy + Math.sin(p.burstAngle) * p.burstDist * ease;

          ctx.fillStyle = p.c;
          ctx.fillRect(p.x - pxSize / 2, p.y - pxSize / 2, drawSize, drawSize);
        }

        // Completed explosion: clean finish without lag
        if (tNorm >= 1) {
          finishIntro(true);
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    // Fail-safe timeout
    const safetyTimer = setTimeout(() => {
      finishIntro(true);
    }, 7000);

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
      className={`fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-500 ease-out ${
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
      <div 
        className={`relative z-20 flex flex-col items-center gap-3 mt-6 pointer-events-auto transition-all duration-400 ease-out ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
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
