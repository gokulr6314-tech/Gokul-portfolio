/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from './GlassCard';
import PillButton from './PillButton';
import { ContactSubmission, FirebaseConfig } from '../types';
import { 
  Send, Mail, Github, Linkedin, Twitter, Sparkles, CheckCircle2, History, AlertCircle, FileText, Database, Flame, RefreshCw 
} from 'lucide-react';
import CompactVirtualPet from './compact-pet/CompactVirtualPet';
import FirebaseConnectModal from './FirebaseConnectModal';
import { 
  getStoredFirebaseConfig, 
  saveMessageToFirebase, 
  fetchFirebaseMessages, 
  getPreferredDatabaseType,
  DatabaseType
} from '../services/firebase';

export const WHATSAPP_PHONE = '919025941874';

export const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', detail: '' });
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  
  // Firebase database state
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [firebaseDbType, setFirebaseDbType] = useState<DatabaseType>('firestore');
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  // Load history and Firebase status on mount
  useEffect(() => {
    const config = getStoredFirebaseConfig();
    if (config) {
      setIsFirebaseConnected(true);
      setFirebaseDbType(getPreferredDatabaseType());
    }

    const saved = localStorage.getItem('portfolio_submissions');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
  }, []);

  const handleConnectionChange = (connected: boolean, config: FirebaseConfig | null) => {
    setIsFirebaseConnected(connected);
    if (connected) {
      setFirebaseDbType(getPreferredDatabaseType());
      // Optionally auto-sync messages from Firebase
      syncFromFirebase();
    }
  };

  const syncFromFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const cloudMessages = await fetchFirebaseMessages();
      if (cloudMessages && cloudMessages.length > 0) {
        // Merge with existing local submissions
        setSubmissions(prev => {
          const map = new Map<string, ContactSubmission>();
          // Cloud takes precedence
          cloudMessages.forEach(m => map.set(m.id, m));
          prev.forEach(m => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          const merged = Array.from(map.values());
          localStorage.setItem('portfolio_submissions', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Firebase sync notice:', e);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    const clientName = formData.name.trim();
    const clientEmail = formData.email.trim();
    const clientMessage = formData.message.trim();

    const newSubmission: ContactSubmission = {
      id: crypto.randomUUID(),
      name: clientName,
      email: clientEmail,
      message: clientMessage,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      source: isFirebaseConnected ? 'firebase' : 'local'
    };

    let savedToCloud = false;

    // Attempt Firebase Save if configured
    if (isFirebaseConnected) {
      try {
        const result = await saveMessageToFirebase(newSubmission);
        if (result.success) {
          savedToCloud = true;
        }
      } catch (fbErr) {
        console.warn('Firebase save fallback to local:', fbErr);
      }
    }

    // Always update local storage for immediate responsiveness & backup
    const sourceMode: 'firebase' | 'local' = savedToCloud ? 'firebase' : 'local';
    const updated: ContactSubmission[] = [{ ...newSubmission, source: sourceMode }, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('portfolio_submissions', JSON.stringify(updated));

    // Construct formatted WhatsApp message URL
    const whatsappText = 
      `*New Portfolio Inquiry*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Name:* ${clientName}\n` +
      `📧 *Email:* ${clientEmail}\n` +
      `💬 *Message:* ${clientMessage}\n` +
      `🕒 *Time:* ${new Date().toLocaleString()}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappText)}`;
    setLastWhatsAppUrl(whatsappUrl);

    // Launch WhatsApp
    try {
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        // Fallback for pop-up blockers
        window.location.href = whatsappUrl;
      }
    } catch (err) {
      console.warn('Could not launch WhatsApp window automatically:', err);
    }

    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);

    setSuccessMessage({
      title: 'Transmitting to WhatsApp!',
      detail: `Your message has been formatted for WhatsApp (+91 90259 41874) and archived${savedToCloud ? ' to Firebase' : ''}.`
    });

    setSubmitSuccess(true);
    // Auto dismiss success window
    setTimeout(() => setSubmitSuccess(false), 8000);
  };

  const clearHistory = () => {
    if (window.confirm('Do you want to clear your local message history?')) {
      setSubmissions([]);
      localStorage.removeItem('portfolio_submissions');
    }
  };

  return (
    <section id="contact" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-12">
      {/* Miniature Interactive Virtual Pet Companion (confined game sandbox) */}
      <div className="flex justify-start mb-8">
        <CompactVirtualPet />
      </div>

      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] font-mono text-slate-500/80 mb-2"
        >
          conjoin pathways
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-light text-slate-900 tracking-tight"
        >
          Begin a <span className="font-serif italic text-slate-800">Conforming Dialogue</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Direct Channels & Social Row */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-display font-light text-slate-800 mb-6 leading-relaxed">
              Seeking architectural ideas or simply looking to connect?
            </h3>
            <p className="text-sm text-slate-600 font-sans leading-relaxed mb-8 font-light">
              Don’t hesitate to write—I look forward to discussing creative design models, reactive interfaces, or potential consulting roles. Let's design digital spaces that matter.
            </p>

            {/* Structured Quick Contact Links: Email & WhatsApp */}
            <div className="flex flex-col gap-3 mb-10">
              <motion.a
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:gokulr6314@gmail.com"
                className="inline-flex items-center gap-3.5 liquid-glass-card p-3.5 rounded-[22px] group cursor-pointer"
              >
                <div className="p-2.5 liquid-glass-icon-container rounded-xl text-sky-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">directly email</p>
                  <p className="text-xs font-display font-medium text-slate-800">gokulr6314@gmail.com</p>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hello Gokul! I saw your portfolio and would like to connect.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3.5 liquid-glass-card p-3.5 rounded-[22px] group cursor-pointer border border-emerald-500/25 hover:border-emerald-500/40"
              >
                <div className="p-2.5 liquid-glass-icon-container rounded-xl text-emerald-600 bg-emerald-500/10 transition-colors">
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-mono tracking-widest text-emerald-700 uppercase flex items-center gap-1.5 font-semibold">
                    <span>WhatsApp Direct</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </p>
                  <p className="text-xs font-display font-medium text-slate-800">+91 90259 41874</p>
                </div>
              </motion.a>
            </div>
          </div>

          {/* Social icons row */}
          <div>
            <p className="text-[10px] font-mono tracking-[0.15em] text-slate-400 uppercase mb-4 select-none">
              digital channels
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, url: 'https://twitter.com', name: 'Twitter' },
                { icon: Github, url: 'https://github.com/gokulr6314-tech', name: 'GitHub' },
                { icon: Linkedin, url: 'https://www.linkedin.com/in/gokul-ramesh1?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BlVqRIPTqRTusB3bhJd184Q%3D%3D', name: 'LinkedIn' },
                { icon: WhatsAppIcon, url: `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hello Gokul! I saw your portfolio and would like to connect.")}`, name: 'WhatsApp' },
              ].map((channel, i) => {
                const IconComp = channel.icon;
                return (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 liquid-glass-icon-container rounded-2xl text-slate-600 hover:text-sky-600 hover:border-white/80 transition-all duration-300 cursor-pointer animate-none"
                    title={channel.name}
                  >
                    <IconComp className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Form & Submission Log History section */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <GlassCard className="shadow-none">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col">
                  <label htmlFor="name-input" className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2 select-none">
                    Your Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-4 text-slate-800 text-sm font-sans placeholder-slate-400/60 liquid-glass-input"
                    placeholder="E.g. Alexis Carter"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label htmlFor="email-input" className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2 select-none">
                    Email Address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-4 text-slate-800 text-sm font-sans placeholder-slate-400/60 liquid-glass-input"
                    placeholder="alexis@domain.com"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col">
                <label htmlFor="message-input" className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2 select-none">
                  Your Message
                </label>
                <textarea
                  id="message-input"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="p-4 text-slate-800 text-sm font-sans placeholder-slate-400/60 liquid-glass-input resize-none leading-relaxed"
                  placeholder="Tell me about your idea..."
                />
              </div>

              {/* Submit Button Row */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                <PillButton 
                  id="submit-btn"
                  variant="primary" 
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <WhatsAppIcon className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                      <span>Transmit to WhatsApp</span>
                    </span>
                  )}
                </PillButton>

                {/* Toggle History Button */}
                {submissions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`text-xs font-mono font-medium flex items-center gap-1.5 py-2 px-3 rounded-full cursor-pointer transition-all ${
                      showHistory 
                        ? 'liquid-glass-chip-active text-slate-900' 
                        : 'liquid-glass-toggle text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Logged Submissions ({submissions.length})</span>
                  </button>
                )}
              </div>
            </form>
          </GlassCard>

          {/* Toast style / animation for Success state */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="flex items-start gap-3 p-4 bg-emerald-50/95 border border-emerald-200/70 rounded-2xl shadow-sm text-emerald-900 text-xs font-sans font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block text-emerald-950 mb-0.5">{successMessage.title || 'Message transmitted!'}</span>
                  <p className="text-emerald-800 leading-relaxed">{successMessage.detail}</p>
                  {lastWhatsAppUrl && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <a
                        href={lastWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-mono font-medium transition-colors shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                        <span>Open WhatsApp Chat</span>
                      </a>
                      <span className="text-[10px] font-mono text-emerald-700/80">Delivers to +91 90259 41874</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submissions Log Dashboard */}
          <AnimatePresence>
            {showHistory && submissions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <GlassCard className="py-5 px-6">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-200/40 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-mono tracking-wider font-semibold text-slate-700">YOUR TRANSMISSION HISTORY</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {isFirebaseConnected && (
                        <button
                          type="button"
                          onClick={syncFromFirebase}
                          disabled={isSyncingFirebase}
                          className="flex items-center gap-1 text-[10px] font-mono text-sky-600 hover:text-sky-800 cursor-pointer disabled:opacity-50"
                          title="Fetch latest messages from Firebase database"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                          <span>Sync Cloud</span>
                        </button>
                      )}

                      <button
                        onClick={clearHistory}
                        className="text-[10px] font-mono text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Purge Logs
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="p-3.5 bg-white/70 border border-white/85 rounded-xl shadow-[1px_1px_4px_rgba(0,0,0,0.015)]">
                        <div className="flex justify-between items-start mb-1.5 flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-display font-medium text-slate-800 capitalize">{sub.name}</span>
                            {sub.source === 'firebase' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                                Firebase
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                                Local
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">{sub.timestamp}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mb-2 truncate max-w-full" title={sub.email}>{sub.email}</p>
                        <p className="text-xs text-slate-600 font-sans italic line-clamp-3 leading-relaxed">"{sub.message}"</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Firebase Connection Modal */}
      <FirebaseConnectModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConnectionChange={handleConnectionChange}
      />
    </section>
  );
}
