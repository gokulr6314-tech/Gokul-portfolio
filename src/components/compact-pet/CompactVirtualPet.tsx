/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { CompactPetChar, CompactPetThemeId, CompactPetTheme } from './types';
import { 
  COMPACT_PET_THEMES, 
  DINO_RUNNING_WIDTH, 
  DINO_STANDING_HEIGHT, 
  DINO_DUCKING_WIDTH,
  MIN_GROWTH, 
  MAX_GROWTH 
} from './constants';
import PixelDino from './PixelDino';
import PixelBlob from './PixelBlob';
import PixelBunny from './PixelBunny';
import PixelGhost from './PixelGhost';
import CompactPetControl from './CompactPetControl';
import DinoRunnerGame from './DinoRunnerGame';

interface FloatingParticle {
  id: string;
  icon: string;
  xOffset: number;
  yOffset: number;
}

// Dino starting position before starting the game (exactly matches DinoRunnerGame)
const START_X = 35; // centered over left edge 24 with width 22
const GROUND_Y = 135; // matches GROUND_Y = 135 in DinoRunnerGame

export default function CompactVirtualPet() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent States - default to application's sky color theme
  const [themeId, setThemeId] = useState<CompactPetThemeId>('sky');
  const [character, setCharacter] = useState<CompactPetChar>('dino');
  const [growthLevel, setGrowthLevel] = useState<number>(MIN_GROWTH);
  const [isControlOpen, setIsControlOpen] = useState<boolean>(false);
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Animation & Physics States
  const [isMoving, setIsMoving] = useState<boolean>(false); // stationary at starting place
  const [isFed, setIsFed] = useState<boolean>(false);
  const [isDucking, setIsDucking] = useState<boolean>(false);
  const [reactionText, setReactionText] = useState<string | null>(null);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  // Dino stays in the starting place before game starts
  const petPos = { x: START_X, y: GROUND_Y };
  const isPointerInsideRef = useRef<boolean>(false);
  const lastFedTimeRef = useRef<number>(0);

  // Restore stored preferences
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio_compact_pet_theme') as CompactPetThemeId;
      // If user had previous default 'green', migrate to application's 'sky' color
      if (savedTheme && COMPACT_PET_THEMES[savedTheme] && savedTheme !== 'green') {
        setThemeId(savedTheme);
      } else {
        setThemeId('sky');
        localStorage.setItem('portfolio_compact_pet_theme', 'sky');
      }

      const savedChar = localStorage.getItem('portfolio_compact_pet_char') as CompactPetChar;
      if (savedChar && ['blob', 'bunny', 'ghost', 'dino'].includes(savedChar)) setCharacter(savedChar);

      const savedGrowth = parseInt(localStorage.getItem('portfolio_compact_pet_growth') || '', 10);
      if (!isNaN(savedGrowth) && savedGrowth >= MIN_GROWTH && savedGrowth <= MAX_GROWTH) {
        setGrowthLevel(savedGrowth);
      }
    } catch {}
  }, []);

  // Listen for Spacebar when cursor enters box -> starts T-Rex runner game!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPointerInsideRef.current && !isPlayingGame && !isControlOpen) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          setIsPlayingGame(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingGame, isControlOpen]);

  const handleSelectTheme = (id: CompactPetThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem('portfolio_compact_pet_theme', id);
    } catch {}
  };

  const handleSelectCharacter = (char: CompactPetChar) => {
    setCharacter(char);
    try {
      localStorage.setItem('portfolio_compact_pet_char', char);
    } catch {}
  };

  const handleResetGrowth = () => {
    setGrowthLevel(MIN_GROWTH);
    try {
      localStorage.setItem('portfolio_compact_pet_growth', MIN_GROWTH.toString());
    } catch {}
  };

  // Pointer interactions inside the container
  const handlePointerMove = () => {
    isPointerInsideRef.current = true;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    isPointerInsideRef.current = false;
    setIsHovered(false);
  };

  // Feeding & Growth interaction
  const handleFeed = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    const now = performance.now();
    if (now - lastFedTimeRef.current < 350) return;
    lastFedTimeRef.current = now;

    // Increment growth level
    setGrowthLevel((prev) => {
      const next = Math.min(MAX_GROWTH, prev + 1);
      try {
        localStorage.setItem('portfolio_compact_pet_growth', next.toString());
      } catch {}
      return next;
    });

    setIsFed(true);
    setIsDucking(true);

    const icons = ['❤️', '✨', '⭐', '🍓'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newParticle: FloatingParticle = {
      id: crypto.randomUUID(),
      icon: randomIcon,
      xOffset: (Math.random() - 0.5) * 20,
      yOffset: -12
    };

    setParticles(prev => [...prev.slice(-3), newParticle]);
    setReactionText(growthLevel >= MAX_GROWTH ? 'Max! 👑' : `Lv.${Math.min(MAX_GROWTH, growthLevel + 1)}`);

    setTimeout(() => setIsDucking(false), 380);
    setTimeout(() => setIsFed(false), 650);
    setTimeout(() => setReactionText(null), 1100);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 850);
  }, [growthLevel]);

  const currentTheme: CompactPetTheme = COMPACT_PET_THEMES[themeId] || COMPACT_PET_THEMES.green;

  // Growth scale (1.0 to 1.45)
  const growthScale = 1 + (growthLevel - 1) * 0.09;
  const currentWidth = (isDucking ? DINO_DUCKING_WIDTH : DINO_RUNNING_WIDTH) * growthScale;
  const currentHeight = (isDucking ? 15 : DINO_STANDING_HEIGHT) * growthScale;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-[260px] sm:w-[275px] h-[165px] rounded-2xl bg-white/45 backdrop-blur-md border border-white/70 shadow-sm shadow-slate-900/5 select-none overflow-hidden transition-all duration-300 hover:shadow-md hover:border-white/90"
      style={{
        boxShadow: `0 4px 20px -2px ${currentTheme.glow}, 0 2px 8px -2px rgba(0,0,0,0.04)`
      }}
    >
      {/* If playing the T-Rex runner game, render full arcade canvas */}
      {isPlayingGame ? (
        <DinoRunnerGame
          theme={currentTheme}
          onExit={() => setIsPlayingGame(false)}
        />
      ) : (
        /* Otherwise, render peaceful companion pet habitat */
        <div className="relative w-full h-full p-3 flex flex-col justify-between">
          {/* Top Header Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500/90 font-medium">
                pixel companion
              </span>
            </div>

            {/* Right Buttons: Play Runner Game & Customization Popover */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPlayingGame(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-white shadow-xs cursor-pointer transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: currentTheme.primary }}
                title="Play Chrome Dino Runner Game (or press Space)"
              >
                <Play className="w-2.5 h-2.5 fill-white" />
                <span>Play</span>
              </button>

              <button
                type="button"
                onClick={() => setIsControlOpen(!isControlOpen)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-all cursor-pointer focus:outline-none"
                title="Customize pet theme & character"
                aria-label="Toggle pet customization"
              >
                <Sparkles
                  className="w-3.5 h-3.5 transition-transform"
                  style={{ color: currentTheme.primary }}
                />
              </button>
            </div>
          </div>

          {/* Decorative Drifting Pixel Clouds */}
          <div className="absolute top-7 left-4 opacity-35 pointer-events-none animate-[pulse_4s_infinite]">
            <svg width="28" height="12" viewBox="0 0 28 12" shapeRendering="crispEdges">
              <rect x="4" y="2" width="16" height="4" fill="#94A3B8" />
              <rect x="8" y="0" width="8" height="2" fill="#94A3B8" />
              <rect x="0" y="6" width="24" height="4" fill="#94A3B8" />
            </svg>
          </div>

          <div className="absolute top-10 right-8 opacity-25 pointer-events-none">
            <svg width="22" height="10" viewBox="0 0 22 10" shapeRendering="crispEdges">
              <rect x="3" y="2" width="12" height="3" fill="#94A3B8" />
              <rect x="6" y="0" width="6" height="2" fill="#94A3B8" />
              <rect x="0" y="5" width="18" height="3" fill="#94A3B8" />
            </svg>
          </div>

          {/* Retro Pixel Ground Track Line (matches GROUND_Y = 135 in DinoRunnerGame) */}
          <div 
            className="absolute left-2 right-2 border-b-2 border-dashed border-slate-300/80 pointer-events-none" 
            style={{ top: '135px' }}
          />

          {/* Miniature Ground Bump/Pebbles aligned to track */}
          <div 
            className="absolute left-24 w-2 h-1 bg-slate-300/60 rounded-xs pointer-events-none" 
            style={{ top: '138px' }}
          />
          <div 
            className="absolute right-16 w-3 h-1 bg-slate-300/60 rounded-xs pointer-events-none" 
            style={{ top: '138px' }}
          />

          {/* The Confined Living Pixel Pet (Anchored at starting place before game starts) */}
          <motion.div
            className="absolute cursor-pointer select-none group"
            style={{
              left: petPos.x,
              top: petPos.y,
              width: currentWidth,
              height: currentHeight,
              transform: 'translate(-50%, -100%)',
              imageRendering: 'pixelated'
            }}
            animate={{
              scale: isFed ? [1, 1.15, 0.95, 1] : 1,
              y: isFed ? [-6, 0] : 0
            }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            onClick={handleFeed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Click to feed me! Press Space to Play Runner!"
          >
            {/* Render Active Character */}
            {character === 'dino' && (
              <PixelDino theme={currentTheme} isFed={isFed} isMoving={isMoving} isDucking={isDucking} />
            )}
            {character === 'blob' && (
              <PixelBlob theme={currentTheme} isFed={isFed} isMoving={isMoving} isDucking={isDucking} />
            )}
            {character === 'bunny' && (
              <PixelBunny theme={currentTheme} isFed={isFed} isMoving={isMoving} isDucking={isDucking} />
            )}
            {character === 'ghost' && (
              <PixelGhost theme={currentTheme} isFed={isFed} isMoving={isMoving} isDucking={isDucking} />
            )}

            {/* Reaction Pill Badge */}
            <AnimatePresence>
              {reactionText && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -18, scale: 1 }}
                  exit={{ opacity: 0, y: -26, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -top-1 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold bg-white text-slate-800 shadow-xs border border-slate-200 pointer-events-none z-20"
                >
                  {reactionText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Heart / Sparkle Particles on Feed */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, y: 0, x: p.xOffset, scale: 0.7 }}
                  animate={{ opacity: 0, y: -30, x: p.xOffset * 1.4, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="absolute top-0 left-1/2 text-[10px] pointer-events-none"
                >
                  {p.icon}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Bottom Row: Space to Play prompt when hovered / clicked */}
          <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-slate-400">
            {isHovered ? (
              <span className="font-bold text-slate-600 animate-pulse">
                [ Press Space to Play ]
              </span>
            ) : (
              <span>click pet to feed</span>
            )}
            <span className="text-[8px] opacity-75">Lv.{growthLevel}</span>
          </div>

          {/* Settings Popover (Theme + Character selector) */}
          <AnimatePresence>
            {isControlOpen && (
              <CompactPetControl
                isOpen={isControlOpen}
                onClose={() => setIsControlOpen(false)}
                selectedTheme={currentTheme}
                onSelectTheme={handleSelectTheme}
                selectedCharacter={character}
                onSelectCharacter={handleSelectCharacter}
                growthLevel={growthLevel}
                onResetGrowth={handleResetGrowth}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
