/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from './GlassCard';
import { Project } from '../types';
import { ExternalLink, Github, ArrowUpRight, FolderGit2 } from 'lucide-react';

const PROJECTS_DATA: Project[] = [
  {
    id: 'travel-ease',
    title: 'Travel ease',
    description: 'A modern, intuitive ticket booking platform designed to facilitate effortless searches, secure journey selections, and smooth reservation processing.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Interactive Booking'],
    link: 'https://traveleasey.netlify.app/',
    category: 'web',
    featured: true
  },
  {
    id: 'travellerco',
    title: 'travellerco',
    description: 'A collaborative, end-to-end travel mapping and ticket coordination system crafted for real-time itinerary updates and fluid booking management.',
    tech: ['React', 'Tailwind CSS', 'Vite', 'Booking Api'],
    link: 'https://travellerco.netlify.app/',
    category: 'web',
    featured: true
  },
  {
    id: 'prompt-sandbox',
    title: 'Prompt Sandbox',
    description: 'A structured playground to draft, parameterize, and testing system cues and templates for generative LLMs. Features responsive card outputs.',
    tech: ['React 19', 'Gemini SDK Basics', 'Tailwind', 'Local History'],
    link: '#',
    github: '#',
    category: 'experimental',
    featured: true
  },
  {
    id: 'sentiment-gauge',
    title: 'Sentiment Gauge Spec',
    description: 'A beautiful visual dashboard mockup grading word weights and sentiment strings dynamically. Emphasizes clean, low-clutter margin spacing.',
    tech: ['HTML5 Canvas', 'Tailwind CSS V4', 'Regular Expressions'],
    link: '#',
    github: '#',
    category: 'design',
    featured: true
  }
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'design' | 'experimental'>('all');

  const filteredProjects = activeTab === 'all' 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.category === activeTab);

  return (
    <section id="projects" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-12">
      {/* Title */}
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] font-mono text-slate-500/80 mb-2"
        >
          My portfolio
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-light text-slate-900 tracking-tight"
        >
          Selected Form & <span className="font-serif italic text-slate-800">Creations</span>
        </motion.h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1.5 liquid-glass-pill-container rounded-full">
          {(['all', 'web', 'design', 'experimental'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-2 px-6 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-300 capitalize ${
                activeTab === tab 
                  ? 'frosted-glass-active-pill text-slate-900 scale-105' 
                  : 'text-slate-500 hover:text-slate-900 nav-item-hover-glow'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <GlassCard 
                className="h-full flex flex-col justify-between p-6 md:p-6"
              >
                <div>
                  {/* Category Pill Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest liquid-glass-chip rounded-md py-1 px-2.5 shadow-sm select-none">
                      {project.category}
                    </span>
                    <FolderGit2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 duration-300" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-light text-slate-800 leading-tight mb-3">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-slate-600 font-sans leading-relaxed mb-6 font-light">
                    {project.description}
                  </p>
                </div>

                {/* Footer specs / links */}
                <div>
                  {/* Tech item stack */}
                  <div className="flex flex-wrap gap-1.5 mb-5 select-none">
                    {project.tech.map((t, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-mono tracking-wide px-2 py-0.5 liquid-glass-chip rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4 border-t border-white/20 pt-4 mt-auto">
                    <a
                      href={project.link}
                      className="text-xs font-display font-medium text-slate-800 hover:text-sky-600 flex items-center gap-1 group transition-colors duration-300"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </a>
                    {project.github && (
                      <a
                        href={project.github}
                        className="text-xs font-display font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 group transition-colors duration-300"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    )}
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
