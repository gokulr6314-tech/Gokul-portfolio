/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  hoverEffect?: boolean;
  key?: string | number;
}

export default function GlassCard({ children, className = '', id }: GlassCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`liquid-glass-card rounded-3xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}
