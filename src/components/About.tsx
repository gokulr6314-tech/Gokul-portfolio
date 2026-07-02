/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import GlassCard from './GlassCard';
import { Mail, ShieldCheck, MapPin, ExternalLink, Award, Coffee } from 'lucide-react';
import avatarImg from '../assets/images/Gk.blazer.pic.jpeg';

export default function About() {
  const stats = [
    { label: 'Built Creations', value: '3+', icon: Award },
    { label: 'Years of Alchemy', value: '2+', icon: ShieldCheck },
    { label: 'Cups of Roasts', value: '180+', icon: Coffee }
  ];

  return (
    <section id="about" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-12">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] font-mono text-slate-500/80 mb-2"
        >
          the mind behind the analytics
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-light text-slate-900 tracking-tight"
        >
          Scientific Curiosity, <span className="font-serif italic text-slate-800">Visual Sensibility</span>
        </motion.h2>
      </div>

      <GlassCard className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Avatar & Location Block */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group p-3 liquid-glass-icon-container rounded-[40px] mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-sky-200/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur" />
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-[32px] shadow-inner relative z-10 bg-slate-100/30 border border-slate-200/55 overflow-hidden flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <img
                id="photo"
                src={avatarImg}
                alt="Gokul"
                referrerPolicy="no-referrer"
                className="profile-img avatar w-full h-full object-cover filter grayscale"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 liquid-glass-chip py-2 px-5 rounded-full text-xs font-display font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Chennai & Thanjavur</span>
          </div>
        </div>

        {/* Right Side: Professional Background & Philosophy */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl font-display font-light text-slate-800 mb-6">
            Bridging artificial intelligence with clean, insightful visual representations.
          </h3>
          
          <div className="space-y-4 text-slate-600 leading-relaxed font-sans text-sm md:text-base">
            <p>
              I am an aspiring specialist in Artificial Intelligence and Data Science. I focus on deploying predictive endpoints, preparing robust data structures, and engineering responsive interfaces to make complex machine learning flows accessible and actionable.
            </p>
            <p>
              My philosophy centers on simplicity. I pair statistical rigor with visual breathing room, ensuring high-dimensional data outputs are communicated with absolute clarity, performance, and professional appeal.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center mb-1 text-slate-400 group-hover:text-sky-500 duration-300">
                    <Icon className="w-4 h-4 text-sky-500/80" />
                  </div>
                  <div className="font-display font-semibold text-slate-800 text-lg md:text-xl">{stat.value}</div>
                  <div className="text-[10px] font-mono tracking-wide text-slate-500 uppercase mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
