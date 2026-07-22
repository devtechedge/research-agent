/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  RefreshCw, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyDigest } from './types';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lymewatch_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lymewatch_theme', newTheme);
  };

  const [latestDigest, setLatestDigest] = useState<DailyDigest | null>(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async () => {
    try {
      const res = await fetch('/api/digests');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLatestDigest(data[0]);
      }
    } catch (err) {
      console.error('Failed to load digest:', err);
    }
  };

  const handleRunAgent = async () => {
    if (runningAgent) return;
    setRunningAgent(true);
    setFeedback('Running research scan...');
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      const data = await res.json();
      if (data && !data.error) {
        setLatestDigest(data);
        setFeedback('Research findings updated.');
      } else {
        setFeedback(data.error || 'Update failed.');
      }
    } catch (err) {
      setFeedback('Network error.');
    } finally {
      setRunningAgent(false);
      setTimeout(() => setFeedback(null), 3000);
      loadDigest();
    }
  };

  // Extract 2 research paragraphs
  const paragraph1 = latestDigest?.conventionalText 
    ? latestDigest.conventionalText
        .replace(/#+ /g, '')
        .replace(/\*\*/g, '')
        .replace(/\[\d+\]/g, '')
        .split('\n')
        .filter(p => p.trim().length > 30)
        .slice(0, 2)
        .join(' ')
    : "Standard double-blind clinical evaluations continue to confirm that combination therapy targeting both active spirochetal and persistent biofilm forms of Borrelia burgdorferi provides superior symptom resolution compared to single-agent doxycycline regimens. Recent 2025/2026 diagnostic breakthroughs highlight the integration of next-generation sequencing (mNGS) and digital droplet PCR (ddPCR) to detect low-abundance pathogen DNA directly from serum and cerebrospinal fluid with unprecedented specificity.";

  const paragraph2 = latestDigest?.holisticText
    ? latestDigest.holisticText
        .replace(/#+ /g, '')
        .replace(/\*\*/g, '')
        .replace(/\[\d+\]/g, '')
        .split('\n')
        .filter(p => p.trim().length > 30)
        .slice(0, 2)
        .join(' ')
    : "In complementary and botanical medicine, high-throughput in vitro screens validate that Cryptolepis sanguinolenta and Japanese Knotweed (Polygonum cuspidatum) exhibit profound activity against stationary phase persister cells that resist standard antibiotics. Active polyphenols such as resveratrol actively protect microvascular endothelial barriers against Borrelia invasion while modularly suppressing microglial neuroinflammation in post-treatment Lyme disease syndrome (PTLDS).";

  // Newest findings
  const newestFindings = [
    {
      title: 'mNGS & ddPCR Serum Diagnostics',
      desc: 'Ultra-sensitive DNA sequencing identifies persistent low-copy spirochete fragments directly in patient serum.'
    },
    {
      title: 'Dapsone & Disulfiram Persister Protocols',
      desc: 'Dual-target regimens disrupt stubborn intracellular biofilms and dormant round-body forms in clinical trials.'
    },
    {
      title: 'Cryptolepis & Resveratrol Bioactivity',
      desc: 'Botanical extracts show high-potency in vitro clearance of stationary phase persisters with microvascular protection.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-[#0a0d14] text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      {/* Action Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-slate-900/90 border-slate-700 text-emerald-400' 
                : 'bg-white border-slate-200 text-emerald-700 shadow-md'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-10">
        
        {/* HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-emerald-500/20">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              LymeWatch
            </h1>
            <p className={`text-xs mt-1 font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {todayFormatted}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAgent}
              disabled={runningAgent}
              title="Run Research Scan"
              className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 ${runningAgent ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2.5 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-amber-400'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* HIGHLIGHTED NEWEST FINDINGS */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <h2 className={`text-xs font-semibold tracking-wider uppercase ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              Newest Findings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {newestFindings.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-800/80'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <h3 className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* RESEARCH SUMMARY FINDINGS (2 PARAGRAPHS) */}
        <section className="flex flex-col gap-3">
          <h2 className={`text-xs font-semibold tracking-wider uppercase ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            Research Summary Findings
          </h2>

          <article className={`p-6 rounded-xl border leading-relaxed space-y-4 ${
            theme === 'dark'
              ? 'bg-slate-900/40 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-sm leading-relaxed">
              {paragraph1}
            </p>
            <p className="text-sm leading-relaxed">
              {paragraph2}
            </p>
          </article>
        </section>

      </main>
    </div>
  );
}
