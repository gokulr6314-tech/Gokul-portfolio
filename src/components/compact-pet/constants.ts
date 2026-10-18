/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompactPetTheme, CompactPetThemeId, CompactPetChar } from './types';

export const COMPACT_PET_THEMES: Record<CompactPetThemeId, CompactPetTheme> = {
  sky: {
    id: 'sky',
    name: 'Sky (App)',
    primary: '#0284C7',
    secondary: '#E0F2FE',
    dark: '#0369A1',
    ring: '#0C4A6E',
    glow: 'rgba(2, 132, 199, 0.25)'
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    primary: '#1E293B',
    secondary: '#F1F5F9',
    dark: '#0F172A',
    ring: '#334155',
    glow: 'rgba(30, 41, 59, 0.2)'
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    primary: '#2563EB',
    secondary: '#DBEAFE',
    dark: '#1D4ED8',
    ring: '#1E3A8A',
    glow: 'rgba(37, 99, 235, 0.25)'
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
    dark: '#6D28D9',
    ring: '#4C1D95',
    glow: 'rgba(139, 92, 246, 0.25)'
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    primary: '#EC4899',
    secondary: '#FCE7F3',
    dark: '#BE185D',
    ring: '#831843',
    glow: 'rgba(236, 72, 153, 0.25)'
  },
  green: {
    id: 'green',
    name: 'Green',
    primary: '#10B981',
    secondary: '#D1FAE5',
    dark: '#047857',
    ring: '#064E3B',
    glow: 'rgba(16, 185, 129, 0.25)'
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    primary: '#F97316',
    secondary: '#FFEDD5',
    dark: '#C2410C',
    ring: '#7C2D12',
    glow: 'rgba(249, 115, 22, 0.25)'
  }
};

export const COMPACT_THEME_KEYS: CompactPetThemeId[] = ['sky', 'slate', 'blue', 'purple', 'pink', 'green', 'orange'];

export const COMPACT_CHARACTERS: { id: CompactPetChar; label: string }[] = [
  { id: 'blob', label: 'blob' },
  { id: 'bunny', label: 'bunny' },
  { id: 'ghost', label: 'ghost' },
  { id: 'dino', label: 'dino' }
];

export const DINO_RUNNING_WIDTH = 22;       // originally 44px
export const DINO_STANDING_HEIGHT = 23.5;   // originally 47px
export const DINO_DUCKING_WIDTH = 29.5;     // originally 59px

export const MIN_GROWTH = 1;
export const MAX_GROWTH = 6;
