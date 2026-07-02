/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import BackgroundEffect from './components/BackgroundEffect';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="relative min-h-screen text-slate-800 antialiased selection:bg-sky-200/50 selection:text-slate-900">
      {/* Dynamic interactive gradient shift */}
      <BackgroundEffect />

      {/* Structured Floating Top Bar */}
      <Navbar />

      {/* Page scroll flow */}
      <main className="relative z-10 pt-[76px]">
        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <About />

        {/* Skills Section */}
        <Skills />

        {/* Projects Grid Section */}
        <Projects />

        {/* Contact Form Logs Section */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
