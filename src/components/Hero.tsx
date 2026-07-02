/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, Code, Palette, Cpu, Database, BarChart3 } from 'lucide-react';
import PillButton from './PillButton';
import { useState } from 'react';

const LENSES = [
  { 
    id: 'ai', 
    label: 'AI & DS Exploration', 
    icon: Cpu, 
    heading: 'Exploring smart agentic behaviors.', 
    sub: 'Integrating large language models, dynamic prompts, and responsive neural interfaces.' 
  },
  { 
    id: 'datascience', 
    label: 'Data Science', 
    icon: Database, 
    heading: 'Uncovering trends and hidden patterns.', 
    sub: 'Wrangling, scrubbing, and analyzing datasets with clear scientific rigor.' 
  },
  { 
    id: 'visualization', 
    label: 'Interactive Visuals', 
    icon: BarChart3, 
    heading: 'Fusing static math with visual life.', 
    sub: 'Creating intuitive charts, bento dashboard boxes, and interactive statistical layers.' 
  }
];

export default function Hero() {
  const [activeLens, setActiveLens] = useState(LENSES[0]);

  return (
    <section 
      id="hero" 
      className="relative min-h-[95vh] flex flex-col items-center justify-start pt-12 md:pt-14 pb-12 px-4 md:px-8 text-center"
    >
      {/* Decorative Floating Elements */}
      <motion.div 
        animate={{ 
          y: [0, -12, 0],
          rotate: [0, 4, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-[20%] left-[15%] hidden md:block"
      >
        <span className="liquid-glass-chip text-xs font-mono py-1.5 px-3.5 rounded-full select-none font-medium">
          ASPIRING AI & DS
        </span>
      </motion.div>



      {/* Main Hero Container */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Soft Sparkle Intro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 liquid-glass-chip rounded-full py-1.5 px-4 mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-xs tracking-wider font-display font-medium text-slate-700">Available for Freelance & Contract</span>
        </motion.div>

        {/* Small Intro */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-mono text-xs tracking-[0.25em] text-slate-500 uppercase mb-4"
        >
          Gokul Ramesh
        </motion.p>

        {/* Name Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display font-light text-5xl md:text-7xl lg:text-8xl tracking-tight text-slate-900 leading-[1.1] mb-6"
        >
          AI & Data Explorer <br />
          <span className="font-normal text-slate-800 italic font-serif">of the digital spectrum.</span>
        </motion.h1>

        {/* Custom interactive "Lenses" selection to show creative flexibility */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-2.5 p-1.5 liquid-glass-pill-container rounded-full mb-10 max-w-full overflow-x-auto scrollbar-none"
        >
          {LENSES.map((lens) => {
            const IconComp = lens.icon;
            const isSelected = activeLens.id === lens.id;
            return (
              <button
                key={lens.id}
                onClick={() => setActiveLens(lens)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-300 ${
                  isSelected 
                    ? 'frosted-glass-active-pill text-slate-900 scale-105' 
                    : 'text-slate-500 hover:text-slate-900 nav-item-hover-glow'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                {lens.label}
              </button>
            );
          })}
        </motion.div>

        {/* Lens-driven dynamic heading */}
        <div className="h-28 md:h-24 flex flex-col justify-center mb-8 px-6">
          <motion.h2
            key={activeLens.id}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-2xl text-slate-800 font-light font-display max-w-2xl mx-auto"
          >
            {activeLens.heading}
            <span className="block mt-2 text-sm text-slate-500 font-sans tracking-wide leading-relaxed font-normal">
              {activeLens.sub}
            </span>
          </motion.h2>
        </div>

        {/* CTA Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <PillButton href="#projects" variant="primary">
            View My Creations
          </PillButton>
          <PillButton href="#contact" variant="secondary">
            Get In Touch
          </PillButton>
        </motion.div>
      </div>


    </section>
  );
}
