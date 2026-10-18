/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, X } from 'lucide-react';
import { CompactPetTheme } from './types';

interface DinoRunnerGameProps {
  theme: CompactPetTheme;
  onExit: () => void;
}

// 8-bit Web Audio Synthesizer for retro sounds
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  jump() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  score() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  hit() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }
}

const sfx = new SoundFX();

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus_small' | 'cactus_double' | 'cactus_tall' | 'bird';
  wingState?: number;
}

export default function DinoRunnerGame({ theme, onExit }: DinoRunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNight, setIsNight] = useState<boolean>(false);

  const gameStateRef = useRef<'playing' | 'gameover'>('playing');
  const scoreRef = useRef<number>(0);
  const highScoreRef = useRef<number>(0);

  // Game physics parameters
  const GAME_WIDTH = 275;
  const GAME_HEIGHT = 165;
  const GROUND_Y = 135;

  const dinoRef = useRef({
    x: 24,
    y: GROUND_Y - 24,
    width: 22,
    height: 24,
    vy: 0,
    isJumping: false,
    isDucking: false,
    legStep: 0,
    dead: false
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const cloudsRef = useRef<{ x: number; y: number; speed: number }[]>([
    { x: 50, y: 35, speed: 0.5 },
    { x: 180, y: 25, speed: 0.4 },
    { x: 260, y: 45, speed: 0.6 }
  ]);
  const groundOffsetRef = useRef<number>(0);
  const speedRef = useRef<number>(3.8);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const obstacleTimerRef = useRef<number>(0);
  const birdFlapTimerRef = useRef<number>(0);

  // Load High Score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dino_runner_high_score');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) {
          setHighScore(val);
          highScoreRef.current = val;
        }
      }
    } catch {}
  }, []);

  const jump = useCallback(() => {
    const dino = dinoRef.current;
    if (gameStateRef.current === 'gameover') {
      restartGame();
      return;
    }
    if (!dino.isJumping) {
      dino.isJumping = true;
      dino.vy = -7.8;
      sfx.jump();
    }
  }, []);

  const setDuck = useCallback((ducking: boolean) => {
    const dino = dinoRef.current;
    dino.isDucking = ducking;
    if (ducking && !dino.isJumping) {
      dino.width = 29.5;
      dino.height = 15;
      dino.y = GROUND_Y - 15;
    } else if (!dino.isJumping) {
      dino.width = 22;
      dino.height = 24;
      dino.y = GROUND_Y - 24;
    }
  }, []);

  const restartGame = useCallback(() => {
    gameStateRef.current = 'playing';
    setGameState('playing');
    scoreRef.current = 0;
    setScore(0);
    speedRef.current = 3.8;
    obstaclesRef.current = [];
    obstacleTimerRef.current = 40;
    setIsNight(false);

    const dino = dinoRef.current;
    dino.y = GROUND_Y - 24;
    dino.width = 22;
    dino.height = 24;
    dino.vy = 0;
    dino.isJumping = false;
    dino.isDucking = false;
    dino.dead = false;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setDuck(true);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        setDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, setDuck, onExit]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;

      const isGameOver = gameStateRef.current === 'gameover';
      const dino = dinoRef.current;

      if (!isGameOver) {
        // Increment Score
        scoreRef.current += 0.12;
        const currentIntScore = Math.floor(scoreRef.current);
        setScore(currentIntScore);

        // Milestone chime every 100 points
        if (currentIntScore > 0 && currentIntScore % 100 === 0 && Math.abs(scoreRef.current - currentIntScore) < 0.15) {
          sfx.score();
        }

        // High Score
        if (currentIntScore > highScoreRef.current) {
          highScoreRef.current = currentIntScore;
          setHighScore(currentIntScore);
          try {
            localStorage.setItem('dino_runner_high_score', currentIntScore.toString());
          } catch {}
        }

        // Day/Night Cycle (toggle inverted colors every 400 points)
        const nightMode = Math.floor(currentIntScore / 300) % 2 === 1;
        setIsNight(nightMode);

        // Speed ramp up over time
        speedRef.current = Math.min(8.5, 3.8 + currentIntScore * 0.0035);

        // Dino Jump Physics
        if (dino.isJumping) {
          dino.y += dino.vy;
          dino.vy += 0.52; // gravity

          const baseStandingY = GROUND_Y - (dino.isDucking ? 15 : 24);
          if (dino.y >= baseStandingY) {
            dino.y = baseStandingY;
            dino.vy = 0;
            dino.isJumping = false;
          }
        }

        // Animate legs
        dino.legStep = (dino.legStep + 0.22) % 2;

        // Ground scrolling
        groundOffsetRef.current = (groundOffsetRef.current + speedRef.current) % 24;

        // Clouds scrolling
        for (const cloud of cloudsRef.current) {
          cloud.x -= cloud.speed;
          if (cloud.x < -30) cloud.x = GAME_WIDTH + 20;
        }

        // Bird flapping
        birdFlapTimerRef.current = (birdFlapTimerRef.current + 0.15) % 2;

        // Spawn Obstacles
        obstacleTimerRef.current -= 1;
        if (obstacleTimerRef.current <= 0) {
          const spawnBird = currentIntScore > 120 && Math.random() < 0.35;

          if (spawnBird) {
            // Birds spawn at 2 heights: low (must jump) or high (must duck)
            const birdAltitudes = [GROUND_Y - 16, GROUND_Y - 32];
            const chosenY = birdAltitudes[Math.floor(Math.random() * birdAltitudes.length)];
            obstaclesRef.current.push({
              x: GAME_WIDTH + 10,
              y: chosenY,
              width: 18,
              height: 12,
              type: 'bird',
              wingState: 0
            });
          } else {
            // Cacti: Small, Double, or Tall
            const r = Math.random();
            if (r < 0.45) {
              obstaclesRef.current.push({
                x: GAME_WIDTH + 10,
                y: GROUND_Y - 20,
                width: 10,
                height: 20,
                type: 'cactus_small'
              });
            } else if (r < 0.8) {
              obstaclesRef.current.push({
                x: GAME_WIDTH + 10,
                y: GROUND_Y - 22,
                width: 18,
                height: 22,
                type: 'cactus_double'
              });
            } else {
              obstaclesRef.current.push({
                x: GAME_WIDTH + 10,
                y: GROUND_Y - 28,
                width: 12,
                height: 28,
                type: 'cactus_tall'
              });
            }
          }

          // Random spawn interval inversely proportional to speed
          obstacleTimerRef.current = Math.floor(55 + Math.random() * 50 - (speedRef.current * 3));
        }

        // Update Obstacles & Check Collisions
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.x -= speedRef.current;

          // AABB Hitbox collision check with subtle 3px forgiving inset
          const dinoBox = {
            left: dino.x + 3,
            right: dino.x + dino.width - 3,
            top: dino.y + 3,
            bottom: dino.y + dino.height
          };

          const obsBox = {
            left: obs.x + 2,
            right: obs.x + obs.width - 2,
            top: obs.y + 2,
            bottom: obs.y + obs.height
          };

          if (
            dinoBox.left < obsBox.right &&
            dinoBox.right > obsBox.left &&
            dinoBox.top < obsBox.bottom &&
            dinoBox.bottom > obsBox.top
          ) {
            // Collision! Game Over
            dino.dead = true;
            gameStateRef.current = 'gameover';
            setGameState('gameover');
            sfx.hit();
          }

          if (obs.x < -30) {
            obstaclesRef.current.splice(i, 1);
          }
        }
      }

      // ==========================================
      // RENDERING (Clean Retro Pixel Art)
      // ==========================================
      const bgFill = isNight ? '#1E293B' : '#FFFFFF';
      const spriteColor = isNight ? '#F8FAFC' : theme.primary;
      const darkColor = isNight ? '#94A3B8' : theme.dark;
      const groundColor = isNight ? '#475569' : '#CBD5E1';
      const textColor = isNight ? '#E2E8F0' : '#475569';

      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Render Clouds
      ctx.fillStyle = isNight ? '#334155' : '#E2E8F0';
      for (const c of cloudsRef.current) {
        ctx.fillRect(c.x + 4, c.y + 2, 16, 4);
        ctx.fillRect(c.x + 8, c.y, 8, 2);
        ctx.fillRect(c.x, c.y + 6, 24, 4);
      }

      // Render Ground Line
      ctx.fillStyle = groundColor;
      for (let x = -groundOffsetRef.current; x < GAME_WIDTH; x += 12) {
        ctx.fillRect(x, GROUND_Y, 8, 1);
      }
      ctx.fillRect(0, GROUND_Y + 1, GAME_WIDTH, 1);

      // Render Obstacles
      for (const obs of obstaclesRef.current) {
        if (obs.type === 'cactus_small') {
          // Single Small Cactus
          ctx.fillStyle = darkColor;
          ctx.fillRect(obs.x + 3, obs.y, 4, 20); // main trunk
          ctx.fillRect(obs.x, obs.y + 5, 3, 7);  // left arm
          ctx.fillRect(obs.x + 7, obs.y + 7, 3, 6); // right arm
          ctx.fillRect(obs.x, obs.y + 5, 4, 2);
          ctx.fillRect(obs.x + 6, obs.y + 7, 4, 2);
        } else if (obs.type === 'cactus_double') {
          // Double Cacti cluster
          ctx.fillStyle = darkColor;
          // First trunk
          ctx.fillRect(obs.x + 2, obs.y + 3, 4, 19);
          ctx.fillRect(obs.x, obs.y + 8, 2, 6);
          // Second trunk
          ctx.fillRect(obs.x + 10, obs.y, 4, 22);
          ctx.fillRect(obs.x + 14, obs.y + 6, 3, 7);
          ctx.fillRect(obs.x + 8, obs.y + 8, 3, 5);
        } else if (obs.type === 'cactus_tall') {
          // Tall Cactus
          ctx.fillStyle = darkColor;
          ctx.fillRect(obs.x + 4, obs.y, 4, 28);
          ctx.fillRect(obs.x, obs.y + 6, 4, 9);
          ctx.fillRect(obs.x + 8, obs.y + 10, 4, 9);
        } else if (obs.type === 'bird') {
          // Flying Pterodactyl (2-frame animated wings)
          ctx.fillStyle = darkColor;
          const wingUp = Math.floor(birdFlapTimerRef.current) === 0;

          // Body & Beak
          ctx.fillRect(obs.x + 4, obs.y + 4, 9, 4);
          ctx.fillRect(obs.x, obs.y + 5, 4, 2); // beak
          ctx.fillRect(obs.x + 13, obs.y + 5, 4, 2); // tail

          // Wings
          if (wingUp) {
            ctx.fillRect(obs.x + 6, obs.y - 4, 4, 8);
            ctx.fillRect(obs.x + 8, obs.y - 7, 3, 4);
          } else {
            ctx.fillRect(obs.x + 6, obs.y + 6, 4, 6);
            ctx.fillRect(obs.x + 8, obs.y + 10, 3, 4);
          }
        }
      }

      // Render Dino (Standing, Running, Ducking, or Dead)
      if (dino.isDucking) {
        // Ducking Dino
        ctx.fillStyle = spriteColor;
        // Tail & back
        ctx.fillRect(dino.x, dino.y + 5, 6, 6);
        ctx.fillRect(dino.x + 6, dino.y + 3, 14, 8);
        ctx.fillRect(dino.x + 18, dino.y, 11, 10); // stretched head
        ctx.fillRect(dino.x + 27, dino.y + 2, 2, 6); // snout
        
        // Eye
        ctx.fillStyle = dino.dead ? '#EF4444' : '#1E293B';
        ctx.fillRect(dino.x + 22, dino.y + 2, 2, 2);

        // Legs
        ctx.fillStyle = darkColor;
        ctx.fillRect(dino.x + 10, dino.y + 10, 3, 5);
        ctx.fillRect(dino.x + 16, dino.y + 10, 3, 5);
      } else {
        // Standing / Running Dino
        ctx.fillStyle = spriteColor;

        // Head & Snout
        ctx.fillRect(dino.x + 11, dino.y, 9, 3);
        ctx.fillRect(dino.x + 11, dino.y + 3, 11, 6);
        ctx.fillRect(dino.x + 20, dino.y + 2, 2, 5); // snout tip
        ctx.fillRect(dino.x + 11, dino.y + 9, 10, 2);

        // Eye
        ctx.fillStyle = dino.dead ? '#EF4444' : '#1E293B';
        if (dino.dead) {
          // X Eye
          ctx.fillRect(dino.x + 14, dino.y + 2, 2, 2);
        } else {
          ctx.fillRect(dino.x + 14, dino.y + 2, 2, 2);
          ctx.fillStyle = 'white';
          ctx.fillRect(dino.x + 14, dino.y + 2, 1, 1);
        }

        // Neck & Torso
        ctx.fillStyle = spriteColor;
        ctx.fillRect(dino.x + 8, dino.y + 11, 8, 8);
        ctx.fillRect(dino.x + 4, dino.y + 13, 5, 5);
        ctx.fillRect(dino.x, dino.y + 15, 4, 3); // tail

        // Little arm
        ctx.fillStyle = darkColor;
        ctx.fillRect(dino.x + 16, dino.y + 13, 3, 2);

        // Legs
        if (dino.isJumping || isGameOver) {
          ctx.fillRect(dino.x + 9, dino.y + 19, 2, 5);
          ctx.fillRect(dino.x + 14, dino.y + 19, 2, 5);
        } else {
          // Stride animation
          const step = Math.floor(dino.legStep);
          if (step === 0) {
            ctx.fillRect(dino.x + 8, dino.y + 19, 2, 5);
            ctx.fillRect(dino.x + 14, dino.y + 19, 2, 3);
            ctx.fillRect(dino.x + 16, dino.y + 21, 2, 2);
          } else {
            ctx.fillRect(dino.x + 8, dino.y + 19, 2, 3);
            ctx.fillRect(dino.x + 6, dino.y + 21, 2, 2);
            ctx.fillRect(dino.x + 14, dino.y + 19, 2, 5);
          }
        }
      }

      // Render Score (Retro 8-bit text format: HI 00055  00028)
      ctx.fillStyle = textColor;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      const curStr = Math.floor(scoreRef.current).toString().padStart(5, '0');
      const hiStr = highScoreRef.current.toString().padStart(5, '0');
      ctx.fillText(`HI ${hiStr}  ${curStr}`, GAME_WIDTH - 10, 18);

      // Render Game Over Overlay
      if (isGameOver) {
        ctx.fillStyle = isNight ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('G A M E   O V E R', GAME_WIDTH / 2, 60);

        ctx.font = '9px monospace';
        ctx.fillText('Press Space or Tap to Restart', GAME_WIDTH / 2, 85);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [theme, isNight]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.enabled = !sfx.enabled;
    setIsMuted(!sfx.enabled);
  };

  return (
    <div
      onClick={jump}
      className={`relative w-full h-full flex flex-col justify-between rounded-2xl select-none overflow-hidden transition-colors duration-300 ${
        isNight ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-70">
            T-REX RUNNER
          </span>
          <button
            type="button"
            onClick={toggleSound}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 transition-all cursor-pointer"
          title="Exit to Pet Companion (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer block"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />

      {/* Game Over Action Button if Game Over */}
      {gameState === 'gameover' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            restartGame();
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          <RotateCcw className="w-3 h-3" />
          <span>RETRY</span>
        </button>
      )}

      {/* Mobile Touch Jump & Duck Hint at Bottom */}
      <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[8px] font-mono opacity-50 pointer-events-none">
        <span>Tap / Space: Jump</span>
        <span>↓: Duck</span>
      </div>
    </div>
  );
}
