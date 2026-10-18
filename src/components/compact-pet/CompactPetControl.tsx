/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { CompactPetChar, CompactPetTheme, CompactPetThemeId } from './types';
import { COMPACT_PET_THEMES, COMPACT_THEME_KEYS, COMPACT_CHARACTERS, MAX_GROWTH } from './constants';

interface CompactPetControlProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTheme: CompactPetTheme;
  onSelectTheme: (id: CompactPetThemeId) => void;
  selectedCharacter: CompactPetChar;
  onSelectCharacter: (char: CompactPetChar) => void;
  growthLevel: number;
  onResetGrowth: () => void;
}

export default function CompactPetControl({
  isOpen,
  onClose,
  selectedTheme,
  onSelectTheme,
  selectedCharacter,
  onSelectCharacter,
  growthLevel,
  onResetGrowth
}: CompactPetControlProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 flex flex-col justify-between border border-white/80 shadow-lg text-slate-800 select-none overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">
          PET SETTINGS
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close settings"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* THEME ROW (6 Circular options) */}
      <div>
        <div className="text-[9px] uppercase font-mono font-semibold text-slate-400 mb-1">
          THEME
        </div>
        <div className="flex items-center justify-between gap-1">
          {COMPACT_THEME_KEYS.map((key) => {
            const theme = COMPACT_PET_THEMES[key];
            const isActive = selectedTheme.id === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectTheme(key)}
                className="p-0.5 rounded-full cursor-pointer focus:outline-none"
                aria-label={`Select ${theme.name} theme`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'ring-2 ring-slate-800 ring-offset-1 scale-110' : 'hover:scale-105 opacity-85'
                  }`}
                  style={{ backgroundColor: theme.primary }}
                >
                  {isActive && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHARACTER PILLS (4 options) */}
      <div>
        <div className="text-[9px] uppercase font-mono font-semibold text-slate-400 mb-1">
          CHARACTER
        </div>
        <div className="grid grid-cols-4 gap-1">
          {COMPACT_CHARACTERS.map((char) => {
            const isActive = selectedCharacter === char.id;

            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`py-1 px-1 rounded-full text-[10px] font-mono transition-all text-center cursor-pointer ${
                  isActive
                    ? 'text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: isActive ? selectedTheme.primary : undefined
                }}
              >
                {char.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* GROWTH STATUS BAR */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="text-[9px] font-mono text-slate-500 font-semibold">
          Growth: Lv.{growthLevel}/{MAX_GROWTH}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(growthLevel / MAX_GROWTH) * 100}%`,
                backgroundColor: selectedTheme.primary
              }}
            />
          </div>
          {growthLevel > 1 && (
            <button
              type="button"
              onClick={onResetGrowth}
              title="Reset size to Lv.1"
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
