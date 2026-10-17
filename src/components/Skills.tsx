/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import GlassCard from './GlassCard';
import { Palette, Code, Terminal, Cpu, Layout, Eye, Database, Globe } from 'lucide-react';

interface SkillItem {
  name: string;
  level: string; // "Expert" | "Advanced" | "Proficient"
}

interface SkillCategory {
  title: string;
  description: string;
  icon: any;
  skills: SkillItem[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Artificial Intelligence',
    description: 'Studying generative model APIs, practicing context windows, and building automated prompt pipelines.',
    icon: Cpu,
    skills: [
      { name: 'Gemini API Integration', level: 'Learning' },
      { name: 'Prompt Engineering', level: 'Proficient' },
      { name: 'Python Basics', level: 'Learning' },
      { name: 'Vector Search Concepts', level: 'Junior' },
      { name: 'AI Chatbot Interfaces', level: 'Learning' }
    ]
  },
  {
    title: 'Data Science & Querying',
    description: 'Wrangling spreadsheet structures, sanitizing tables, and analyzing database relationships.',
    icon: Database,
    skills: [
      { name: 'Pandas & NumPy Basics', level: 'Learning' },
      { name: 'SQL Query Foundations', level: 'Learning' },
      { name: 'CSV & JSON Scrubbing', level: 'Proficient' },
      { name: 'Statistical Aggregation', level: 'Junior' },
      { name: 'Firestore Structuring', level: 'Learning' }
    ]
  },
  {
    title: 'Interactive Interfaces',
    description: 'Building clean responsive browser interfaces to visually represent quantitative data.',
    icon: Layout,
    skills: [
      { name: 'React & Vite', level: 'Junior' },
      { name: 'Tailwind CSS V4', level: 'Proficient' },
      { name: 'HTML5 & CSS3 Rules', level: 'Proficient' },
      { name: 'Recharts & Charts', level: 'Learning' },
      { name: 'Git & GitHub Versioning', level: 'Proficient' }
    ]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-12">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] font-mono text-slate-500/80 mb-2"
        >
          My repertoire
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-light text-slate-900 tracking-tight"
        >
          Curated Skillset & <span className="font-serif italic text-slate-800">Competencies</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SKILL_CATEGORIES.map((cat, i) => {
          const IconComponent = cat.icon;
          return (
            <GlassCard key={i} className="flex flex-col h-full">
              {/* Category Header */}
              <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-white/20">
                <div className="p-3 liquid-glass-icon-container rounded-2xl text-sky-500/80">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-slate-800 text-base">{cat.title}</h3>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">focus domain</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-sans font-light">
                {cat.description}
              </p>

              {/* Skills tags/metrics wrapper */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {cat.skills.map((skill, si) => (
                  <motion.div
                    key={si}
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center gap-1.5 p-1 px-3 liquid-glass-chip rounded-full text-[11px] font-medium font-display transition-all duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500/80 animate-pulse" />
                    <span>{skill.name}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-500 ml-1 italic">{skill.level}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
