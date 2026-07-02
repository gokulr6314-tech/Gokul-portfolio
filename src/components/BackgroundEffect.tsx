/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export default function BackgroundEffect() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize position from -1 to 1 based on screen size
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate subtle shift coordinates for decorative blobs
  const blob1ShiftX = mousePos.x * 30;
  const blob1ShiftY = mousePos.y * 30;
  
  const blob2ShiftX = -mousePos.x * 25;
  const blob2ShiftY = -mousePos.y * 25;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
      {/* Base Global Gradient */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'linear-gradient(135deg, #F0F2F5 0%, #E2EDF3 50%, #CDE3EE 100%)',
        }}
      />

      {/* Reactive Radial Glow that tracks cursor */}
      <div
        className="absolute inset-0 opacity-40 transition-transform duration-500 ease-out"
        style={{
          background: `radial-gradient(circle 800px at ${50 + mousePos.x * 15}% ${50 + mousePos.y * 15}%, rgba(197, 227, 239, 0.45) 0%, transparent 80%)`,
        }}
      />

      {/* Glowing Blob 1 - Top Left/Center */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full filter blur-[100px] bg-[#E8EFC3]/20 opacity-75 mix-blend-multiply transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${blob1ShiftX}px, ${blob1ShiftY}px)`,
        }}
      />

      {/* Glowing Blob 2 - Bottom Right */}
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] bg-[#A8D4E6]/30 opacity-80 mix-blend-screen transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${blob2ShiftX}px, ${blob2ShiftY}px)`,
        }}
      />

      {/* Glowing Blob 3 - Center Right with a soft pinkish tone for extra depth */}
      <div
        className="absolute top-[40%] -right-[15%] w-[40vw] h-[40vw] rounded-full filter blur-[110px] bg-[#EBE4F5]/25 opacity-60 mix-blend-multiply transition-transform duration-[1200ms] ease-out"
        style={{
          transform: `translate(${blob1ShiftY * 0.8}px, ${blob2ShiftX * 0.8}px)`,
        }}
      />
    </div>
  );
}
