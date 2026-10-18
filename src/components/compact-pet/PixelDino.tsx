/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompactPetTheme } from './types';

interface PixelDinoProps {
  theme: CompactPetTheme;
  isFed: boolean;
  isMoving: boolean;
  isDucking?: boolean;
}

export default function PixelDino({ theme, isFed, isMoving, isDucking }: PixelDinoProps) {
  if (isDucking) {
    // Ducking Sprite (59x26)
    return (
      <div className="relative w-full h-full flex items-center justify-center select-none">
        <svg
          viewBox="0 0 59 26"
          className="w-full h-full"
          shapeRendering="crispEdges"
          style={{ imageRendering: 'pixelated' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tail */}
          <rect x="0" y="10" width="3" height="3" fill={theme.primary} />
          <rect x="3" y="9" width="4" height="4" fill={theme.primary} />
          <rect x="7" y="8" width="5" height="5" fill={theme.primary} />

          {/* Back Spines */}
          <rect x="12" y="7" width="2" height="2" fill={theme.dark} />
          <rect x="18" y="5" width="2" height="2" fill={theme.dark} />
          <rect x="25" y="4" width="2" height="2" fill={theme.dark} />

          {/* Ducking Body */}
          <rect x="12" y="7" width="24" height="9" fill={theme.primary} />
          <rect x="16" y="11" width="16" height="4" fill={theme.secondary} opacity="0.9" />

          {/* Head & Snout */}
          <rect x="36" y="2" width="18" height="12" fill={theme.primary} />
          <rect x="54" y="3" width="5" height="8" fill={theme.primary} />
          <rect x="52" y="11" width="5" height="3" fill={theme.primary} />

          {/* Eye */}
          {isFed ? (
            <rect x="42" y="5" width="4" height="2" fill="#1E293B" />
          ) : (
            <>
              <rect x="42" y="4" width="3" height="3" fill="#1E293B" />
              <rect x="42" y="4" width="1" height="1" fill="white" />
            </>
          )}

          {/* Forearm */}
          <rect x="35" y="13" width="4" height="2" fill={theme.dark} />

          {/* Legs */}
          <rect x="20" y="16" width="3" height="7" fill={theme.dark} />
          <rect x={isMoving ? "17" : "20"} y="23" width="5" height="2" fill={theme.dark} />

          <rect x="30" y="16" width="3" height="7" fill={theme.dark} />
          <rect x={isMoving ? "32" : "30"} y="23" width="5" height="2" fill={theme.dark} />
        </svg>
      </div>
    );
  }

  // Running / Standing Sprite (44x47)
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 44 47"
        className="w-full h-full"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dorsal Back Ridges */}
        <rect x="10" y="15" width="2" height="2" fill={theme.dark} />
        <rect x="8" y="19" width="2" height="2" fill={theme.dark} />
        <rect x="6" y="23" width="2" height="2" fill={theme.dark} />

        {/* Head */}
        <rect x="22" y="0" width="16" height="4" fill={theme.primary} />
        <rect x="22" y="4" width="20" height="8" fill={theme.primary} />
        <rect x="38" y="3" width="4" height="8" fill={theme.primary} />
        
        {/* Snout & Mouth */}
        <rect x="34" y="10" width="8" height="1" fill={theme.dark} />
        <rect x="22" y="12" width="16" height="3" fill={theme.primary} />
        <rect x="42" y="4" width="1" height="1" fill={theme.dark} />

        {/* Pixel Eye */}
        {isFed ? (
          <>
            <rect x="26" y="4" width="4" height="1" fill="#1E293B" />
            <rect x="25" y="5" width="1" height="2" fill="#1E293B" />
            <rect x="29" y="5" width="1" height="2" fill="#1E293B" />
          </>
        ) : (
          <>
            <rect x="26" y="3" width="3" height="3" fill="#1E293B" />
            <rect x="26" y="3" width="1" height="1" fill="white" />
          </>
        )}

        {/* Neck & Body */}
        <rect x="22" y="15" width="7" height="4" fill={theme.primary} />
        <rect x="14" y="17" width="17" height="16" fill={theme.primary} />
        <rect x="21" y="21" width="8" height="10" fill={theme.secondary} opacity="0.9" />

        {/* Forearm */}
        <rect x="31" y="22" width="3" height="2" fill={theme.dark} />
        <rect x="33" y="24" width="2" height="2" fill={theme.dark} />

        {/* Tail */}
        <rect x="8" y="21" width="6" height="7" fill={theme.primary} />
        <rect x="4" y="24" width="4" height="6" fill={theme.primary} />
        <rect x="1" y="27" width="3" height="5" fill={theme.primary} />
        <rect x="0" y="29" width="2" height="4" fill={theme.primary} />

        {/* Legs & Animated Walking Pixel Feet */}
        <rect x="16" y="33" width="3" height="8" fill={theme.dark} />
        <rect
          x={isMoving ? "13" : "16"}
          y="41"
          width="5"
          height="3"
          fill={theme.dark}
        />

        <rect x="24" y="33" width="3" height="8" fill={theme.dark} />
        <rect
          x={isMoving ? "27" : "24"}
          y="41"
          width="5"
          height="3"
          fill={theme.dark}
        />
      </svg>
    </div>
  );
}
