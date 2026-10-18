/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompactPetTheme } from './types';

interface PixelBunnyProps {
  theme: CompactPetTheme;
  isFed: boolean;
  isMoving: boolean;
  isDucking?: boolean;
}

export default function PixelBunny({ theme, isFed, isMoving, isDucking }: PixelBunnyProps) {
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
        {/* Left Ear */}
        <rect x="5" y="1" width="3" height="8" fill={theme.primary} />
        <rect x="6" y="3" width="1" height="5" fill={theme.secondary} />

        {/* Right Ear */}
        <rect x="14" y="1" width="3" height="8" fill={theme.primary} />
        <rect x="15" y="3" width="1" height="5" fill={theme.secondary} />

        {/* Head */}
        <rect x="7" y="7" width="8" height="2" fill={theme.primary} />
        <rect x="4" y="9" width="14" height="9" fill={theme.primary} />
        <rect x="3" y="11" width="16" height="6" fill={theme.primary} />

        {/* Cheeks */}
        <rect x="4" y="14" width="2" height="1" fill={theme.dark} opacity="0.6" />
        <rect x="16" y="14" width="2" height="1" fill={theme.dark} opacity="0.6" />

        {/* Eyes & Nose */}
        {isFed ? (
          <>
            <rect x="6" y="12" width="2" height="1" fill="#1E293B" />
            <rect x="5" y="13" width="1" height="1" fill="#1E293B" />
            <rect x="8" y="13" width="1" height="1" fill="#1E293B" />

            <rect x="14" y="12" width="2" height="1" fill="#1E293B" />
            <rect x="13" y="13" width="1" height="1" fill="#1E293B" />
            <rect x="16" y="13" width="1" height="1" fill="#1E293B" />

            <rect x="10" y="14" width="2" height="1" fill="#1E293B" />
          </>
        ) : (
          <>
            <rect x="6" y="12" width="2" height="2" fill="#1E293B" />
            <rect x="6" y="12" width="1" height="1" fill="white" />

            <rect x="14" y="12" width="2" height="2" fill="#1E293B" />
            <rect x="14" y="12" width="1" height="1" fill="white" />

            <rect x="10" y="14" width="2" height="1" fill={theme.dark} />
            <rect x="10" y="15" width="2" height="1" fill="#1E293B" />
          </>
        )}

        {/* Whiskers */}
        <rect x="1" y="13" width="2" height="1" fill="#1E293B" opacity="0.5" />
        <rect x="1" y="15" width="2" height="1" fill="#1E293B" opacity="0.5" />
        <rect x="19" y="13" width="2" height="1" fill="#1E293B" opacity="0.5" />
        <rect x="19" y="15" width="2" height="1" fill="#1E293B" opacity="0.5" />

        {/* Feet */}
        <rect x="5" y="18" width="12" height="2" fill={theme.primary} />
        <rect x={isMoving ? "5" : "6"} y="20" width="3" height="2" fill={theme.secondary} />
        <rect x={isMoving ? "14" : "13"} y="20" width="3" height="2" fill={theme.secondary} />
      </svg>
    </div>
  );
}
