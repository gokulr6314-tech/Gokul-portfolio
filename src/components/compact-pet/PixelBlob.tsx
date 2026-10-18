/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompactPetTheme } from './types';

interface PixelBlobProps {
  theme: CompactPetTheme;
  isFed: boolean;
  isMoving: boolean;
  isDucking?: boolean;
}

export default function PixelBlob({ theme, isFed, isMoving, isDucking }: PixelBlobProps) {
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
        <rect x="7" y="3" width="8" height="1" fill={theme.primary} />
        <rect x="5" y="4" width="12" height="2" fill={theme.primary} />
        <rect x="3" y="6" width="16" height="3" fill={theme.primary} />
        <rect x="2" y="9" width="18" height="8" fill={theme.primary} />
        <rect x="3" y="17" width="16" height="3" fill={theme.primary} />
        <rect x="4" y="20" width="14" height="1" fill={theme.dark} />

        {/* Pixel Highlight */}
        <rect x="6" y="5" width="2" height="1" fill="white" opacity="0.8" />
        <rect x="5" y="6" width="1" height="2" fill="white" opacity="0.8" />

        {/* Cheeks */}
        <rect x="4" y="14" width="2" height="1" fill={theme.dark} opacity="0.7" />
        <rect x="16" y="14" width="2" height="1" fill={theme.dark} opacity="0.7" />

        {/* Eyes & Mouth */}
        {isFed ? (
          <>
            <rect x="6" y="11" width="2" height="1" fill="#1E293B" />
            <rect x="5" y="12" width="1" height="1" fill="#1E293B" />
            <rect x="8" y="12" width="1" height="1" fill="#1E293B" />

            <rect x="14" y="11" width="2" height="1" fill="#1E293B" />
            <rect x="13" y="12" width="1" height="1" fill="#1E293B" />
            <rect x="16" y="12" width="1" height="1" fill="#1E293B" />

            <rect x="10" y="14" width="2" height="1" fill="#1E293B" />
          </>
        ) : (
          <>
            <rect x="6" y="11" width="2" height="2" fill="#1E293B" />
            <rect x="6" y="11" width="1" height="1" fill="white" />

            <rect x="14" y="11" width="2" height="2" fill="#1E293B" />
            <rect x="14" y="11" width="1" height="1" fill="white" />

            <rect x="10" y="14" width="2" height="1" fill="#1E293B" />
          </>
        )}

        {isMoving && <rect x="9" y="21" width="4" height="1" fill={theme.dark} />}
      </svg>
    </div>
  );
}
