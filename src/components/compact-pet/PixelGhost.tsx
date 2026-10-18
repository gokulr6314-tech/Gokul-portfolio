/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompactPetTheme } from './types';

interface PixelGhostProps {
  theme: CompactPetTheme;
  isFed: boolean;
  isMoving: boolean;
  isDucking?: boolean;
}

export default function PixelGhost({ theme, isFed, isMoving, isDucking }: PixelGhostProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none transition-transform duration-150 ${isDucking ? 'scale-x-125 scale-y-75' : ''}`}>
      <svg
        viewBox="0 0 22 23"
        className="w-full h-full"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="7" y="2" width="8" height="1" fill={theme.secondary} />
        <rect x="5" y="3" width="12" height="2" fill={theme.secondary} />
        <rect x="4" y="5" width="14" height="4" fill={theme.primary} />
        <rect x="3" y="9" width="16" height="8" fill={theme.primary} />

        {/* Arms */}
        <rect x="1" y="11" width="2" height="3" fill={theme.secondary} />
        <rect x="19" y="11" width="2" height="3" fill={theme.secondary} />

        {/* Cheeks */}
        <rect x="4" y="13" width="2" height="1" fill={theme.dark} opacity="0.6" />
        <rect x="16" y="13" width="2" height="1" fill={theme.dark} opacity="0.6" />

        {/* Eyes & Mouth */}
        {isFed ? (
          <>
            <rect x="6" y="10" width="2" height="1" fill="#1E293B" />
            <rect x="5" y="11" width="1" height="1" fill="#1E293B" />
            <rect x="8" y="11" width="1" height="1" fill="#1E293B" />

            <rect x="14" y="10" width="2" height="1" fill="#1E293B" />
            <rect x="13" y="11" width="1" height="1" fill="#1E293B" />
            <rect x="16" y="11" width="1" height="1" fill="#1E293B" />

            <rect x="10" y="13" width="2" height="2" fill="#1E293B" />
          </>
        ) : (
          <>
            <rect x="6" y="9" width="2" height="3" fill="#1E293B" />
            <rect x="6" y="9" width="1" height="1" fill="white" />

            <rect x="14" y="9" width="2" height="3" fill="#1E293B" />
            <rect x="14" y="9" width="1" height="1" fill="white" />

            <rect x="10" y="12" width="2" height="2" fill="#1E293B" />
          </>
        )}

        {/* Wavy Pixel Hem */}
        <rect x="4" y="17" width="14" height="2" fill={theme.primary} />
        <rect x="4" y="19" width="3" height="2" fill={theme.primary} />
        <rect x="5" y="21" width="1" height="1" fill={theme.primary} />

        <rect x="9" y="19" width="4" height="2" fill={theme.primary} />
        <rect x="10" y="21" width="2" height="1" fill={theme.primary} />

        <rect x="15" y="19" width="3" height="2" fill={theme.primary} />
        <rect x="16" y="21" width="1" height="1" fill={theme.primary} />
      </svg>
    </div>
  );
}
