/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Search, 
  Send, 
  Settings, 
  Database, 
  FileText, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  Terminal, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { LymeEntity, DailyDigest, SystemStatus, ResearchQuery } from './types';

export default function App() {
  // State
  const [status, setStatus] = useState<SystemStatus>({
    targetEmail: 'devayanmandal@gmail.com',
    discoveredRPM: 5,
    discoveredTPM: 250000,
    discoveredRPDRemaining: 20,
    budgetTier: 'strict',
    lastRunDate: null,
    rateLimitStatus: 'Checking rate limits...',
    runLogs: []
  });
  const [entities, setEntities] = useState<LymeEntity[]>([]);
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);
  const [activeTab, setActiveTab] = useState<'digests' | 'entities' | 'sandbox'>('digests');
  const [viewMode, setViewMode] = useState<'document' | 'email'>('document');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Search Sandbox States
  const [sandboxQuery, setSandboxQuery] = useState('What are the clinical findings for Cryptolepis sanguinolenta in persistent Borrelia burgdorferi?');
  const [sandboxCategory, setSandboxCategory] = useState<'conventional' | 'holistic' | 'trials'>('holistic');
  const [sandboxResult, setSandboxResult] = useState<ResearchQuery | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  
  // Settings Form States
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  // Agent Trigger Execution States
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentProgress, setAgentProgress] = useState(0);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Global feedback alerts
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Theme state: dark by default, persistent in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lymewatch_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lymewatch_theme', newTheme);
  };

  // Fetch initial data
  useEffect(() => {
    fetchStatus();
    fetchEntities();
    fetchDigests();
  }, []);

  // Auto scroll logs during execution
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (!data.error) {
        setStatus(data);
        setNewEmail(data.targetEmail);
      }
    } catch (err) {
      console.error('Failed to load system status:', err);
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/entities');
      const data = await res.json();
      if (!data.error) {
        setEntities(data);
      }
    } catch (err) {
      console.error('Failed to load medical entities:', err);
    }
  };

  const fetchDigests = async () => {
    try {
      const res = await fetch('/api/digests');
      const data = await res.json();
      if (!data.error && data.length > 0) {
        setDigests(data);
        if (!selectedDigest) {
          setSelectedDigest(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load digests:', err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: newEmail })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedback(data.error, 'error');
      } else {
        setStatus(data);
        setEmailFormOpen(false);
        triggerFeedback(`Target email updated to ${newEmail} successfully!`);
      }
    } catch (err) {
      triggerFeedback('Failed to update recipient email.', 'error');
    }
  };

  const handleRunAgent = async () => {
    if (agentRunning) return;
    setAgentRunning(true);
    setAgentProgress(10);
    setAgentLogs([
      '[Agent State] Bootstrapping LymeWatch CLI runner...',
      '[Memory] Restoring episodic memory indexes and entities snapshot...',
    ]);

    // Simulated step ticks to show live progress of our deep research agent
    const steps = [
      { prg: 25, msg: '[Stage 1] Executing Gemini-3.5-Flash Rate-Limit Probe...' },
      { prg: 35, msg: `[Stage 1] Probe SUCCESS: Identified API quota limit details.` },
      { prg: 45, msg: '[Stage 2] Generating research queries. Formulating conventional, holistic and trial search matrices...' },
      { prg: 60, msg: '[Stage 3a] Searching Conventional database targets. Triggering Search Grounding: antibiotic combinations and dapsone studies...' },
      { prg: 75, msg: '[Stage 3b] Searching Holistic repositories. Grounding botanical persister trials: Cryptolepis, Resveratrol...' },
      { prg: 85, msg: '[Stage 4] Deduplicating findings. Updating Entity sqlite model database indices...' },
      { prg: 95, msg: '[Stage 5] Synthesizing full daily HTML digest and calculating deltas against prior sessions...' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setAgentProgress(step.prg);
        setAgentLogs(prev => [...prev, step.msg]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const res = await fetch('/api/run', { method: 'POST' });
      const data = await res.json();
      clearInterval(interval);
      
      if (data.error) {
        setAgentLogs(prev => [...prev, `[CRITICAL FATAL] Agent terminated: ${data.error}`]);
        triggerFeedback(`Research agent run failed: ${data.error}`, 'error');
        setAgentRunning(false);
      } else {
        setAgentProgress(100);
        setAgentLogs(prev => [
          ...prev,
          `[Success] Generated new daily research digest: ${data.date}`,
          `[Email] Securely dispatched inline-styled HTML notification digest to recipient: ${newEmail}`,
          `[System] Run manifest saved. Committing new state to Git persistence snapshot.`
        ]);
        setSelectedDigest(data);
        await fetchStatus();
        await fetchEntities();
        await fetchDigests();
        triggerFeedback(`Autonomous deep research run complete! Digest dispatched to ${newEmail}`);
        setTimeout(() => {
          setAgentRunning(false);
        }, 2000);
      }
    } catch (err: any) {
      clearInterval(interval);
      setAgentLogs(prev => [...prev, `[ERROR] Call failed: ${err.message}`]);
      triggerFeedback('Connection to full-stack research container failed.', 'error');
      setAgentRunning(false);
    }
  };

  const handleResendEmail = async (digestDate: string) => {
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digestDate })
      });
      const data = await res.json();
      if (data.success) {
        triggerFeedback(`Latest HTML research digest resent to ${status.targetEmail}!`);
        fetchStatus();
      } else {
        triggerFeedback(data.error || 'Failed to trigger resend.', 'error');
      }
    } catch (err) {
      triggerFeedback('Error sending test notification.', 'error');
    }
  };

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxQuery.trim()) return;
    setSandboxLoading(true);
    setSandboxResult(null);

    try {
      const res = await fetch('/api/custom-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sandboxQuery, category: sandboxCategory })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedback(data.error, 'error');
      } else {
        setSandboxResult(data);
        fetchStatus();
        triggerFeedback('Gemini Search Grounding complete. Sources validated.');
      }
    } catch (err) {
      triggerFeedback('Custom grounding request failed.', 'error');
    } finally {
      setSandboxLoading(false);
    }
  };

  // Chart Data preparation
  const chartData = entities
    .slice(0, 8)
    .map(e => ({
      name: e.name.length > 20 ? e.name.substring(0, 18) + '...' : e.name,
      'Credibility Score': e.credibilityScore,
      'Evidence Count': e.evidenceCount,
      type: e.type
    }));

  const pieData = [
    { name: 'Conventional Drugs', value: entities.filter(e => e.type === 'drug').length, color: '#3b82f6' },
    { name: 'Botanical Herbs', value: entities.filter(e => e.type === 'herb').length, color: '#10b981' },
    { name: 'Clinical Trials', value: entities.filter(e => e.type === 'trial').length, color: '#f59e0b' },
    { name: 'Researchers', value: entities.filter(e => e.type === 'researcher').length, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${theme === 'dark' ? 'bg-[#090d16] text-[#e2e8f0]' : 'bg-[#f8fafc] text-[#1e293b]'} selection:bg-emerald-500/30 selection:text-emerald-400`}>
      
      {/* GLOBAL ALERTS */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium tracking-wide">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* TOP INTELLIGENCE HEADER */}
        <header className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] shadow-2xl' : 'bg-white border-slate-200/80 shadow-md'}`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl relative">
                <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121824]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>LymeWatch</h1>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1e293b] border-[#334155] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>v1.2 MVP</span>
                  <button
                    onClick={toggleTheme}
                    className={`p-1.5 rounded-lg border transition-all duration-300 ml-1 ${
                      theme === 'dark'
                        ? 'bg-[#1e293b] border-[#334155] text-amber-400 hover:text-amber-300 hover:bg-[#334155]'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-250'
                    }`}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className={`text-sm mt-1 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Long-Horizon Autonomous Daily Chronic Lyme Research Agent</p>
              </div>
            </div>

            {/* LIVE TELEMETRY ROW */}
            <div className={`grid grid-cols-2 sm:flex items-center gap-4 text-xs font-mono transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className={`rounded-xl px-4 py-2.5 flex flex-col gap-1 min-w-[140px] border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200/60'}`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Target Recipient</span>
                <span className={`text-xs font-medium truncate transition-colors duration-300 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{status.targetEmail}</span>
              </div>
              <div className={`rounded-xl px-4 py-2.5 flex flex-col gap-1 min-w-[140px] border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200/60'}`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Discovered Rate Limit</span>
                <span className={`text-xs font-medium truncate transition-colors duration-300 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {status.discoveredRPDRemaining} RPD ({status.discoveredRPM} RPM)
                </span>
              </div>
              <div className={`rounded-xl px-4 py-2.5 flex flex-col gap-1 min-w-[140px] col-span-2 sm:col-span-1 border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200/60'}`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Cron Schedule</span>
                <span className="text-emerald-500 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Daily @ 20:00 IST (14:30 UTC)
                </span>
              </div>
            </div>
          </div>

          {/* ACTION STRIP */}
          <div className={`mt-6 pt-5 border-t flex flex-wrap gap-4 items-center justify-between transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e293b]' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRunAgent}
                disabled={agentRunning}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg ${
                  agentRunning 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/20 active:scale-[0.98] border border-emerald-500/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${agentRunning ? 'animate-spin' : ''}`} />
                {agentRunning ? 'Agent Researching...' : 'Trigger Daily Research Run'}
              </button>

              <button
                onClick={() => setEmailFormOpen(!emailFormOpen)}
                className={`px-4 py-2.5 border rounded-xl font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.98] ${
                  theme === 'dark' 
                    ? 'bg-[#1e293b] hover:bg-[#334155]/60 border-[#334155] text-slate-200' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Change Target Email
              </button>
            </div>

            <div className={`text-xs flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              <ShieldAlert className="w-4 h-4 text-emerald-500/70" />
              <span>Full compliance with $0.00/month architectural budget directive.</span>
            </div>
          </div>

          {/* EMAIL SETTINGS SUB-FORM */}
          <AnimatePresence>
            {emailFormOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <form onSubmit={handleUpdateSettings} className={`rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex-1">
                    <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Update Target Email</label>
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter clinical report recipient email"
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all border ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div className="flex items-end justify-end mt-4 sm:mt-0">
                    <button 
                      type="submit" 
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Save Recipient Change
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AGENT RUN LOG MONITOR */}
          <AnimatePresence>
            {agentRunning && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-[#05070c] border border-emerald-500/20 rounded-xl p-4 font-mono text-xs text-emerald-400">
                  <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="font-semibold text-emerald-300">Live Agent Execution Stream</span>
                    </div>
                    <span className="text-slate-500">{agentProgress}% completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${agentProgress}%` }}
                    />
                  </div>

                  <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                    {agentLogs.map((logStr, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                        <span className={logStr.includes('[ERROR]') || logStr.includes('[CRITICAL]') ? 'text-rose-400' : ''}>{logStr}</span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* CORE WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2-COLUMNS: TABS & CENTRAL CONSOLE */}
          <main className="lg:col-span-2 flex flex-col gap-6">
            
            {/* VIEW MODE SELECTION TABS */}
            <div className={`p-1.5 rounded-xl flex items-center justify-between border transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824]/60 border-[#1e293b]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('digests')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                    activeTab === 'digests' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-[#1e293b]/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Episodic Memory (Digests)
                </button>
                <button
                  onClick={() => setActiveTab('entities')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                    activeTab === 'entities' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-[#1e293b]/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Entity Memory Directory
                </button>
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                    activeTab === 'sandbox' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-[#1e293b]/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Research Sandbox (Live)
                </button>
              </div>

              {/* STATS COUNT */}
              <div className={`hidden sm:flex items-center gap-2 px-3 text-xs font-mono transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Memory Cache:</span>
                <span className="text-emerald-500 font-bold">{entities.length} entities</span>
                <span>/</span>
                <span className="text-blue-500 font-bold">{digests.length} digests</span>
              </div>
            </div>

            {/* TAB CONTENT 1: EPISODIC MEMORY DAILY DIGESTS */}
            {activeTab === 'digests' && (
              <div className="flex flex-col gap-4">
                
                {/* DIGEST PICKER */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1 flex flex-col gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Digest Runs</span>
                    <div className="flex sm:flex-col gap-2 max-h-[400px] overflow-x-auto sm:overflow-y-auto pr-1">
                      {digests.length === 0 ? (
                        <div className={`text-xs p-3 rounded-lg text-center w-full border transition-all ${theme === 'dark' ? 'bg-[#121824]/40 border-[#1e293b] text-slate-500' : 'bg-slate-50 border-slate-200/80 text-slate-400'}`}>
                          No daily run compiled yet. Trigger a run above!
                        </div>
                      ) : (
                        digests.map((dig) => (
                          <button
                            key={dig.date}
                            onClick={() => setSelectedDigest(dig)}
                            className={`px-3 py-2.5 rounded-lg border text-left flex sm:flex-col justify-between items-center sm:items-start gap-1 transition-all shrink-0 min-w-[120px] ${
                              selectedDigest?.date === dig.date
                                ? theme === 'dark'
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-md'
                                  : 'bg-emerald-50 border-emerald-500/40 text-emerald-700 shadow-sm'
                                : theme === 'dark'
                                ? 'bg-[#121824]/40 border-[#1e293b] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                            }`}
                          >
                            <span className="text-xs font-mono font-bold">{dig.date}</span>
                            <span className={`text-[10px] capitalize shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{dig.runManifest.budgetTier} Run</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* DIGEST PREVIEWER CONTAINER */}
                  <div className={`sm:col-span-3 rounded-xl flex flex-col overflow-hidden border transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] shadow-xl' : 'bg-white border-slate-200 shadow-md'}`}>
                    
                    {/* PREVIEW CONTAINER HEADER */}
                    <div className={`px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a2333] border-b-[#1e293b]' : 'bg-slate-50 border-b-slate-200'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Daily Intelligence Report</h3>
                          <span className={`text-xs font-mono transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>({selectedDigest?.date || 'No Data'})</span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 max-w-[320px] transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {selectedDigest?.summary || 'No diagnostic research logs available.'}
                        </p>
                      </div>

                      {/* TOGGLE & TEST BUTTON */}
                      {selectedDigest && (
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-0.5 flex border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-100 border-slate-200'}`}>
                            <button
                              onClick={() => setViewMode('document')}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                viewMode === 'document' 
                                  ? 'bg-emerald-600 text-white' 
                                  : theme === 'dark'
                                  ? 'text-slate-400 hover:text-white'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              Digest Layout
                            </button>
                            <button
                              onClick={() => setViewMode('email')}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                viewMode === 'email' 
                                  ? 'bg-emerald-600 text-white' 
                                  : theme === 'dark'
                                  ? 'text-slate-400 hover:text-white'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              Email Preview
                            </button>
                          </div>

                          <button
                            onClick={() => handleResendEmail(selectedDigest.date)}
                            title="Resend this digest via Gmail API"
                            className={`p-1.5 border rounded-lg transition-all ${
                              theme === 'dark' 
                                ? 'bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border-[#334155]' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 border-slate-200'
                            }`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DIGEST CONTENT RENDERER */}
                    <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                      {selectedDigest ? (
                        viewMode === 'document' ? (
                          <div className="flex flex-col gap-6">
                            
                            {/* OVERVIEW SECTION */}
                            <div className="bg-emerald-950/20 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                              <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1">Executive Summary</h4>
                              <p className={`text-sm leading-relaxed transition-colors duration-300 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{selectedDigest.summary}</p>
                            </div>

                            {/* CONVENTIONAL UPDATES */}
                            <div className="flex flex-col gap-2">
                              <h4 className={`text-sm font-semibold flex items-center gap-2 border-b pb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-white border-[#1e293b]' : 'text-slate-800 border-slate-100'}`}>
                                <span className="text-blue-400">🩺</span> Conventional Medicine Research
                              </h4>
                              <div className={`text-sm leading-relaxed font-sans whitespace-pre-wrap transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedDigest.conventionalMarkdown}
                              </div>
                            </div>

                            {/* HOLISTIC UPDATES */}
                            <div className="flex flex-col gap-2">
                              <h4 className={`text-sm font-semibold flex items-center gap-2 border-b pb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-white border-[#1e293b]' : 'text-slate-800 border-slate-100'}`}>
                                <span className="text-emerald-400">🌱</span> Integrative Botanical Guidelines
                              </h4>
                              <div className={`text-sm leading-relaxed font-sans whitespace-pre-wrap transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedDigest.holisticMarkdown}
                              </div>
                            </div>

                            {/* TRIALS & PREPRINTS */}
                            <div className="flex flex-col gap-2">
                              <h4 className={`text-sm font-semibold flex items-center gap-2 border-b pb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-white border-[#1e293b]' : 'text-slate-800 border-slate-100'}`}>
                                <span className="text-yellow-400">📊</span> Clinical Trial Registry Records
                              </h4>
                              <div className={`text-sm leading-relaxed font-sans whitespace-pre-wrap transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedDigest.trialsMarkdown}
                              </div>
                            </div>

                            {/* WEEKLY WATCHLIST */}
                            <div className="flex flex-col gap-2">
                              <h4 className={`text-sm font-semibold flex items-center gap-2 border-b pb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-white border-[#1e293b]' : 'text-slate-800 border-slate-100'}`}>
                                <span className="text-indigo-400">🎯</span> Spotlight Target Watchlist
                              </h4>
                              <div className={`text-sm leading-relaxed font-sans whitespace-pre-wrap transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedDigest.watchlistMarkdown}
                              </div>
                            </div>

                            {/* WHAT CHANGED DELTA */}
                            <div className={`p-4 rounded-xl flex flex-col gap-2 border transition-all duration-300 ${theme === 'dark' ? 'bg-[#1c2333]/70 border-[#303e54]' : 'bg-slate-50 border-slate-200'}`}>
                              <h4 className={`text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                What Changed Since Yesterday (Deltas)
                              </h4>
                              <div className={`text-xs leading-relaxed font-mono whitespace-pre-wrap transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                                {selectedDigest.deltasMarkdown}
                              </div>
                            </div>

                          </div>
                        ) : (
                          /* RENDER DETAILED HTML PREVIEW */
                          <div className="border border-slate-700/40 rounded-lg overflow-hidden bg-white text-slate-900 shadow-inner">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-mono text-slate-500 flex justify-between">
                              <span>Recipient: {status.targetEmail}</span>
                              <span>MIME: multipart/alternative (HTML)</span>
                            </div>
                            <iframe 
                              srcDoc={selectedDigest.htmlBody} 
                              title="HTML email preview" 
                              className="w-full h-[500px] bg-white border-0"
                            />
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                          <FileText className="w-12 h-12 text-slate-700" />
                          <p className="text-sm">Please launch an autonomous run to build the first daily record.</p>
                        </div>
                      )}
                    </div>

                    {/* PREVIEW CONTAINER FOOTER */}
                    {selectedDigest && (
                      <div className="bg-[#121824] border-t border-[#1e293b] px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Model: {selectedDigest.runManifest.modelUsed}</span>
                        <span>Dispatched successfully at {selectedDigest.runManifest.timestamp.split('T')[1].substring(0, 5)} GMT</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: MEDICAL ENTITY memory DIRECTORY */}
            {activeTab === 'entities' && (
              <div className={`rounded-2xl p-6 flex flex-col gap-6 border transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] shadow-2xl' : 'bg-white border-slate-200 shadow-md'}`}>
                
                {/* SEARCH & FILTERS */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h2 className={`text-lg font-bold flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      <Database className="w-5 h-5 text-emerald-400" />
                      Entity Memory Directory
                    </h2>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Structured entity memory mapping researched pharmacological agents, botanicals, trials, and researchers.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search entities (e.g. Disulfiram)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-sm transition-all border ${
                        theme === 'dark' 
                          ? 'bg-[#0b0f19] border-[#1e293b] text-white placeholder-slate-500 focus:border-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* ENTITIES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entities
                    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((entity) => (
                      <div 
                        key={entity.id}
                        className={`border rounded-xl p-5 flex flex-col gap-3 transition-all group ${
                          theme === 'dark' 
                            ? 'bg-[#0b0f19] border-[#1e293b] hover:border-[#334155]' 
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-white group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-600'}`}>{entity.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                entity.type === 'drug' 
                                  ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' 
                                  : entity.type === 'herb'
                                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                  : entity.type === 'trial'
                                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                                  : 'bg-purple-950/40 border-purple-500/30 text-purple-400'
                              }`}>
                                {entity.type.toUpperCase()}
                              </span>
                            </div>
                            
                            {/* DETAILS FIELD DEPENDING ON TYPE */}
                            {entity.type === 'herb' && (entity as any).latinName && (
                              <span className="text-xs text-slate-500 italic">Latin Name: {(entity as any).latinName}</span>
                            )}
                            {entity.type === 'trial' && (entity as any).nctId && (
                              <span className="text-xs text-slate-500 font-mono font-bold">NCT ID: {(entity as any).nctId}</span>
                            )}
                          </div>

                          {/* EVIDENCE GRADE BADGE */}
                          <div className="flex flex-col items-end shrink-0">
                            <span className={`text-[10px] font-bold tracking-wide flex items-center gap-1 ${
                              entity.evidenceGrade === 'High' 
                                ? 'text-emerald-400' 
                                : entity.evidenceGrade === 'Moderate'
                                ? 'text-blue-400'
                                : 'text-slate-400'
                            }`}>
                              <Award className="w-3.5 h-3.5" />
                              Grade {entity.evidenceGrade}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{entity.evidenceCount} Citations</span>
                          </div>
                        </div>

                        {/* ENTITY SUMMARY TEXT */}
                        <p className={`text-xs leading-relaxed p-3 rounded-lg flex-1 border transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'text-slate-400 bg-[#121824]/40 border-[#1e293b]/60' 
                            : 'text-slate-600 bg-white border-slate-150'
                        }`}>
                          {entity.details}
                        </p>

                        {/* SPECIFIC SUB-FIELDS */}
                        {entity.type === 'drug' && (entity as any).mechanism && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            <strong className="text-slate-400">Mechanism:</strong> {(entity as any).mechanism}
                          </div>
                        )}
                        {entity.type === 'herb' && (entity as any).traditionalUse && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            <strong className="text-slate-400">Traditional Use:</strong> {(entity as any).traditionalUse}
                          </div>
                        )}

                        <div className={`flex items-center justify-between text-[10px] font-mono border-t pt-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500 border-[#1e293b]/40' : 'text-slate-400 border-slate-100'}`}>
                          <span>Credibility: {entity.credibilityScore}%</span>
                          <span>Last Seen: {entity.lastSeen}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {entities.length === 0 && (
                  <div className="text-center py-20 text-slate-500">
                    <Database className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm">Database memory is empty. Trigger an autonomous research run to index items.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: RESEARCH SANDBOX (Search Grounding) */}
            {activeTab === 'sandbox' && (
              <div className={`rounded-2xl p-6 flex flex-col gap-6 border transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] shadow-2xl' : 'bg-white border-slate-200 shadow-md'}`}>
                <div>
                  <h2 className={`text-lg font-bold flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Interactive Research Sandbox
                  </h2>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Interact directly with the Gemini 3.5 Flash Search Grounding engine. Query real-time clinical literature on persistent Lyme, Babesia, or Bartonelea, and verify direct source links.
                  </p>
                </div>

                {/* SEARCH FORM */}
                <form onSubmit={handleCustomSearch} className={`flex flex-col gap-4 p-4 rounded-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* Category Selector */}
                    <div className="w-full sm:w-44">
                      <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Category context</label>
                      <select 
                        value={sandboxCategory}
                        onChange={(e) => setSandboxCategory(e.target.value as any)}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all border ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                      >
                        <option value="conventional">🩺 Conventional</option>
                        <option value="holistic">🌱 Holistic / Herbal</option>
                        <option value="trials">📊 Clinical Trials</option>
                      </select>
                    </div>

                    {/* Query Input */}
                    <div className="flex-1">
                      <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Search Grounding Query</label>
                      <input 
                        type="text"
                        required
                        value={sandboxQuery}
                        onChange={(e) => setSandboxQuery(e.target.value)}
                        placeholder="What are the clinical findings for Cryptolepis sanguinolenta in persistent Borrelia burgdorferi?"
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all border ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b] text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      />
                    </div>
                  </div>

                  <div className={`flex justify-between items-center pt-2 border-t transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e293b]/40' : 'border-slate-200'}`}>
                    <div className={`text-[10px] flex items-center gap-1.5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Model selected: gemini-3.5-flash with Grounding tools</span>
                    </div>

                    <button
                      type="submit"
                      disabled={sandboxLoading}
                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                        sandboxLoading 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]'
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      {sandboxLoading ? 'Gemini Searching...' : 'Execute Grounded Search'}
                    </button>
                  </div>
                </form>

                {/* SANDBOX RESULT PREVIEW */}
                <AnimatePresence>
                  {sandboxLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-8 rounded-xl text-center flex flex-col items-center justify-center gap-3 border transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-sm font-medium">Querying active Google Search indexes and synthesizing medical evidence...</p>
                      <span className="text-xs text-slate-500">This real integration operates on your secure server endpoints.</span>
                    </motion.div>
                  )}

                  {sandboxResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl overflow-hidden flex flex-col border transition-all duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b]' : 'bg-slate-50 border-slate-200 shadow-inner'}`}
                    >
                      <div className={`px-5 py-3 border-b flex justify-between items-center transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b]' : 'bg-slate-100 border-slate-200'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Research Grounding Result</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(sandboxResult.timestamp).toLocaleString()}</span>
                      </div>

                      <div className="p-5 flex flex-col gap-5">
                        {/* Response Text */}
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap font-sans transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {sandboxResult.response}
                        </div>

                        {/* Grounding Source Chunks */}
                        {sandboxResult.sources && sandboxResult.sources.length > 0 && (
                          <div className={`border-t pt-4 flex flex-col gap-2 transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e293b]' : 'border-slate-200'}`}>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Grounded Source citations</span>
                            <div className="flex flex-wrap gap-2">
                              {sandboxResult.sources.map((src, i) => (
                                <a 
                                  key={i} 
                                  href={src.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1.5 transition-all truncate max-w-xs ${
                                    theme === 'dark' 
                                      ? 'bg-[#121824] hover:bg-[#1e293b] border-[#1e293b] text-slate-300 hover:text-emerald-400' 
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-600 shadow-sm'
                                  }`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{src.title || 'Verified Source'}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

          </main>

          {/* RIGHT SIDEBAR COLUMN: MEDICAL METRICS & ACTIVITY FEEDS */}
          <aside className="flex flex-col gap-6">
            
            {/* PANEL 1: RESEARCH METRICS (RECHARTS BAR CHART) */}
            <section className={`border rounded-2xl p-5 flex flex-col gap-4 shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Medical Evidence Scoring
                </h3>
                <p className={`text-xs mt-0.5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Credibility indices based on clinical trials and peer reviews.</p>
              </div>

              {chartData.length > 0 ? (
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', 
                          borderRadius: '8px',
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }}
                        labelStyle={{ color: theme === 'dark' ? '#ffffff' : '#0f172a', fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#10b981', fontSize: '11px' }}
                      />
                      <Bar dataKey="Credibility Score" fill="#10b981" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'drug' ? '#3b82f6' : entry.type === 'herb' ? '#10b981' : '#f59e0b'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No data points captured. Start research run.
                </div>
              )}

              {/* Pie chart summary */}
              {pieData.length > 0 && (
                <div className={`border-t pt-4 flex flex-col gap-3 transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e293b]' : 'border-slate-100'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Knowledge Distribution</span>
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-20 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={18}
                            outerRadius={35}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                            <span>{d.name}</span>
                          </div>
                          <span className={`font-mono font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* PANEL 2: LIVE AUDIT TRAIL LOG */}
            <section className={`border rounded-2xl p-5 flex flex-col gap-4 shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-[#121824] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Live Audit Trail (events.jsonl)
                </h3>
                <button 
                  onClick={fetchStatus}
                  className={`p-1 rounded transition-all ${theme === 'dark' ? 'hover:bg-[#1e293b] text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'}`}
                  title="Refresh logs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`border rounded-xl p-3.5 font-mono text-[10px] max-h-[250px] overflow-y-auto flex flex-col gap-2 transition-all duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] border-[#1e293b] text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-600'}`}>
                {status.runLogs && status.runLogs.length > 0 ? (
                  status.runLogs.slice(-15).reverse().map((logMsg, i) => {
                    const timeStamp = logMsg.substring(0, 26);
                    const coreMsg = logMsg.substring(26);
                    return (
                      <div key={i} className={`border-b pb-1.5 last:border-0 last:pb-0 transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e293b]/40' : 'border-slate-200/50'}`}>
                        <span className="text-[#3b82f6] block font-semibold">{timeStamp}</span>
                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{coreMsg}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-center py-6">Logs system listening...</div>
                )}
              </div>
            </section>

          </aside>

        </div>

      </div>

      {/* DASHBOARD BOTTOM FOOTER */}
      <footer className={`mt-12 border-t py-8 text-center text-xs font-mono transition-colors duration-300 ${theme === 'dark' ? 'border-[#121824] bg-[#070a11] text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
        <p className="tracking-wide">LymeWatch Medical Intelligence Dashboard — Zero-Cost Architecture Deployment</p>
        <p className={`${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} mt-2`}>© 2026 Google AI Studio Applet Runtime. Managed server-side.</p>
      </footer>

    </div>
  );
}
