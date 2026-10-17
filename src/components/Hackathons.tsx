/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from './GlassCard';
import { Trophy, Clock, Award, Zap, Code2 } from 'lucide-react';
import { Hackathon } from '../types';

const HACKATHONS_DATA: Hackathon[] = [
  {
    id: 'sih-agritech',
    name: 'Smart India Hackathon (SIH)',
    organizer: 'Ministry of Education & AICTE',
    year: '2024',
    theme: 'AgriTech & AI Solutions',
    projectName: 'PasuPhosak',
    projectDescription: 'Architected an automated dietary ration optimizer and cattle nutrition recommendation engine aimed at boosting smallholder dairy yields.',
    duration: '36 Hours Non-Stop',
    role: 'Lead AI & Frontend Developer',
    tech: ['React', 'AgriTech', 'Data Modeling', 'Tailwind CSS']
  },
  {
    id: 'genai-sprint',
    name: 'GenAI Innovation Sprint',
    organizer: 'Developer Tech Community',
    year: '2024',
    theme: 'Generative AI & LLM Workflows',
    projectName: 'Prompt Sandbox',
    projectDescription: 'Designed a real-time reactive playground to structure, parameterize, and stress-test system cues for generative neural models.',
    duration: '24 Hours Sprint',
    role: 'Full Stack AI Engineer',
    tech: ['Gemini API', 'React 19', 'Prompt Ops', 'Tailwind CSS']
  },
  {
    id: 'msme-hackathon',
    name: 'National MSME Digital Hackathon',
    organizer: 'Commerce & Tech Forum',
    year: '2024',
    theme: 'FinTech & Merchant Systems',
    projectName: 'Vyapar Mitr',
    projectDescription: 'Built an offline-first GST-ready billing companion and digital khata ledger designed for speed on retail counter desktops.',
    duration: '48 Hours Build',
    role: 'Frontend Architect',
    tech: ['React', 'TypeScript', 'Invoice Engine', 'Analytics']
  },
  {
    id: 'smart-mobility-hack',
    name: 'Urban Mobility & Transit Challenge',
    organizer: 'State Innovation Cell',
    year: '2023',
    theme: 'Smart Transit & Booking',
    projectName: 'Travel ease',
    projectDescription: 'Crafted a zero-friction multimodal transit reservation portal with live seat indexing and instant itinerary dispatch.',
    duration: '24 Hours Hackathon',
    role: 'Core Frontend Developer',
    tech: ['React', 'Vite', 'Booking Engine', 'Tailwind CSS']
  }
];

export default function Hackathons() {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const tracks = ['all', 'AgriTech', 'Generative AI', 'FinTech', 'Transit'];

  const filteredHackathons = selectedTrack === 'all'
    ? HACKATHONS_DATA
    : HACKATHONS_DATA.filter(h => h.theme.toLowerCase().includes(selectedTrack.toLowerCase()));

  return (
    <section id="hackathons" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-12">
      {/* Title */}
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] font-mono text-slate-500/80 mb-2"
        >
          Competitive Innovation & Sprints
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-light text-slate-900 tracking-tight"
        >
          Hackathons & <span className="font-serif italic text-slate-800">Sprints</span>
        </motion.h2>
      </div>

      {/* Hero Highlight Bento: Number of Hackathons Attended */}
      <GlassCard className="mb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
          {/* Main Stat: Number of Hackathons Attended */}
          <div className="flex flex-col items-center justify-center p-4 border-r border-white/20 last:border-none">
            <div className="p-3 mb-2 liquid-glass-icon-container rounded-2xl text-amber-500 shadow-sm flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">
              6+
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-600 uppercase mt-1 font-semibold">
              Hackathons Attended
            </div>
          </div>

          {/* Stat 2: Prototypes Shipped */}
          <div className="flex flex-col items-center justify-center p-4 md:border-r border-white/20">
            <div className="p-3 mb-2 liquid-glass-icon-container rounded-2xl text-sky-500 shadow-sm flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">
              6+
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-600 uppercase mt-1 font-semibold">
              Prototypes Built
            </div>
          </div>

          {/* Stat 3: Total Hack Hours */}
          <div className="flex flex-col items-center justify-center p-4 border-r border-white/20 last:border-none">
            <div className="p-3 mb-2 liquid-glass-icon-container rounded-2xl text-indigo-500 shadow-sm flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">
              180+
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-600 uppercase mt-1 font-semibold">
              Sprint Hours
            </div>
          </div>

          {/* Stat 4: Accolades */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-3 mb-2 liquid-glass-icon-container rounded-2xl text-emerald-500 shadow-sm flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">
              3
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-600 uppercase mt-1 font-semibold">
              Awards & Finalists
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 liquid-glass-pill-container rounded-full max-w-full overflow-x-auto scrollbar-none">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`p-2 px-5 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-300 capitalize whitespace-nowrap ${
                selectedTrack === track
                  ? 'frosted-glass-active-pill text-slate-900 scale-105'
                  : 'text-slate-500 hover:text-slate-900 nav-item-hover-glow'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Cards Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredHackathons.map((hackathon) => (
            <motion.div
              layout
              key={hackathon.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <GlassCard className="h-full flex flex-col justify-between p-6 md:p-8 relative overflow-hidden group">
                <div>
                  {/* Top Header Tags */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest liquid-glass-chip rounded-md py-1 px-2.5 shadow-sm">
                      {hackathon.duration}
                    </span>
                  </div>

                  {/* Hackathon Name & Organizer */}
                  <h3 className="text-xl font-display font-light text-slate-800 leading-snug mb-1">
                    {hackathon.name}
                  </h3>
                  {hackathon.organizer && (
                    <p className="text-xs font-mono text-slate-400 mb-4">
                      {hackathon.organizer} {hackathon.year ? `• ${hackathon.year}` : ''}
                    </p>
                  )}

                  {/* Project Highlight */}
                  <div className="mb-4 p-3.5 rounded-2xl bg-white/30 border border-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Code2 className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-xs font-display font-semibold text-slate-800">
                        {hackathon.projectName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 ml-auto">
                        {hackathon.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed font-light">
                      {hackathon.projectDescription}
                    </p>
                  </div>
                </div>

                {/* Footer Tech Stack */}
                <div className="pt-3 border-t border-white/20 mt-2">
                  <div className="flex flex-wrap gap-1.5 select-none">
                    {hackathon.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono tracking-wide px-2 py-0.5 liquid-glass-chip rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
