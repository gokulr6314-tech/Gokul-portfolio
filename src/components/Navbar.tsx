/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Beginning', href: '#hero' },
  { label: 'Philosophy', href: '#about' },
  { label: 'Capabilities', href: '#skills' },
  { label: 'Creations', href: '#projects' },
  { label: 'Conjoin', href: '#contact' }
];

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Simple intersection observer calculation for active links
      const sections = NAV_ITEMS.map(item => item.href.slice(1));
      let currentSection = 'hero';

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the section is near or above the middle of viewport
          if (rect.top <= window.innerHeight * 0.35) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const id = href.slice(1);
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 80;
      window.scrollTo({
        top: top >= 0 ? top : 0,
        behavior: 'smooth'
      });
    }
  };

  const isScrolled = scrollY > 40;

  return (
    <header>
      {/* Container */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 ease-in-out py-3 px-4 md:px-8 origin-center ${
          isScrolled 
            ? 'opacity-100 scale-100 pointer-events-auto liquid-glass-navbar mx-4 md:mx-12 my-3 rounded-[32px] md:rounded-[40px]' 
            : 'opacity-75 scale-[0.97] hover:opacity-100 hover:scale-100 pointer-events-auto liquid-glass-navbar-faded mx-4 md:mx-12 my-3 rounded-[32px] md:rounded-[40px]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 logo-circle-glass rounded-full group-hover:scale-105 duration-300 transition-all flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-left">
              <span className="font-display font-light text-sm tracking-wide text-slate-900 group-hover:opacity-80 transition-opacity">
                Gokul Ramesh
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-[#5A7382] uppercase -mt-0.5">
                interactive architect
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full liquid-glass-pill-container">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-5 py-2.5 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-300 relative ${
                    isActive 
                      ? 'text-slate-900 frosted-glass-active-pill' 
                      : 'text-slate-500 hover:text-slate-900 nav-item-hover-glow'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Mobile hamburger icon */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 logo-circle-glass rounded-full hover:brightness-110 active:scale-95 transition-all text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-x-0 top-[84px] z-30 mx-4 liquid-glass-navbar p-6 rounded-3xl shadow-xl border border-white/40 md:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`p-3 px-4 rounded-2xl text-sm font-display font-medium tracking-wide transition-all ${
                      isActive 
                        ? 'text-slate-900 frosted-glass-active-pill' 
                        : 'text-slate-500 hover:text-slate-900 nav-item-hover-glow'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
