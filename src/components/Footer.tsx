/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowUp, Sparkles } from 'lucide-react';

export default function Footer() {
  const scrollValue = typeof window !== 'undefined' ? window.scrollY : 0;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="border-t border-slate-200/40 relative z-10 py-12 px-4 md:px-8 bg-white/10 backdrop-blur-sm select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side branding */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/80 border border-white rounded-xl shadow-sm text-sky-500">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-display font-light text-xs text-slate-800">
              Gokul Ramesh
            </span>
            <span className="block text-[8px] font-mono tracking-widest text-[#5A7382]/60 uppercase -mt-0.5">
              interactive architect
            </span>
          </div>
        </div>

        {/* Center License text */}
        <div className="text-[11px] font-mono tracking-wider text-slate-400 text-center">
          © {new Date().getFullYear()} Gokul Ramesh. Released under Apache-2.0.
        </div>

        {/* Right Side: Back to Top */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-slate-900 liquid-glass-toggle py-2 px-4 rounded-full cursor-pointer transition-all"
        >
          <span>Return Top</span>
          <ArrowUp className="w-3 h-3 text-sky-600" />
        </motion.button>

      </div>
    </footer>
  );
}
