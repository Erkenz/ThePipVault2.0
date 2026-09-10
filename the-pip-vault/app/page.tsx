// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Activity, Target, Shield, ArrowRight, CheckCircle2, TrendingUp, Cpu, Layers, 
  Terminal, Check, Brain, Users, Clock, Tag, Calendar, BarChart3, LineChart, 
  Wallet, Sparkles, Filter, ChevronRight, AlertCircle, PieChart, DollarSign, 
  Eye, Zap, Sliders, ArrowUpRight, ArrowDownRight, Compass, ShieldCheck, Flame, BookOpen
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'journal' | 'psychology' | 'analytics' | 'accounts'>('journal');
  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans antialiased text-[#0f172a] relative">
      
      {/* Top Beta Announcement Bar */}
      <div className="w-full bg-zinc-950 text-white text-xs font-medium py-2 px-4 border-b border-zinc-900">
        <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/25 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Beta Testing
          </span>
          <span className="text-zinc-300 text-xs">
            The Pip Vault is currently in active beta testing. Enjoy full complimentary access while we fine-tune your trading experience.
          </span>
          <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4 hover:text-amber-300 transition-colors ml-1">
            Claim early access <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-950 border border-zinc-900 text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold tracking-tight text-sm text-zinc-900">
              ThePip<span className="text-slate-400">Vault</span>
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded">
              Beta
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#analytics" className="hover:text-slate-950 transition-colors">Analytics</a>
            <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-950 px-2 py-1.5 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="rounded-md bg-zinc-950 hover:bg-zinc-900 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-[1200px] mx-auto w-full flex flex-col items-center text-center">
        
        {/* Beta Status Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1 text-xs font-medium text-slate-700 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Public Beta 1.0</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-semibold">We are in active beta testing</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-xs uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            All Systems Operational
          </div>
        </div>

        {/* Hero Copy (Using user's exact copy) */}
        <h1 className="max-w-4xl text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.02] mb-6">
          Trading Success. Systematized.
        </h1>
        <p className="max-w-2xl text-base font-medium text-slate-500 leading-relaxed mb-8">
          Log every trade with psychological context. Spot emotional leakage. Compound the edge that data finds — and your gut misses.
        </p>

        {/* Hero Actions */}
        <div className="flex items-center justify-center gap-3 mb-20">
          <Link 
            href="/register"
            className="flex items-center gap-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-white px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all group"
          >
            <span>Start journaling free</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a 
            href="#pricing"
            className="rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            See how it works
          </a>
        </div>

        {/* --- INTERFACE MOCKUP (Sleek, minimal, single-card layout with no dark sidebars) --- */}
        <div className="w-full max-w-[850px] mx-auto rounded-xl border border-slate-200 bg-white shadow-xl p-6 flex flex-col md:flex-row gap-8 items-stretch text-left">
          
          {/* Left Column: The Logged Trade Card */}
          <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-lg p-5 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Trade #2487</span>
                  <span className="text-xs font-bold text-slate-800 uppercase">EUR/USD · LONG</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 rounded text-[9px] font-bold">
                  +$842.50
                </span>
              </div>

              {/* Parameter Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-white border border-slate-200/50 rounded p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Entry</span>
                  <span className="text-xs font-bold text-slate-850">1.0842</span>
                </div>
                <div className="bg-white border border-slate-200/50 rounded p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Exit</span>
                  <span className="text-xs font-bold text-slate-850">1.0891</span>
                </div>
                <div className="bg-white border border-slate-200/50 rounded p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">R:R</span>
                  <span className="text-xs font-bold text-slate-850">1 : 3.2</span>
                </div>
              </div>

              {/* Mindset */}
              <div className="mb-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mindset</span>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-bold">Patient</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-bold">Disciplined</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-bold">Plan aligned</span>
                </div>
              </div>

              {/* Emotions */}
              <div className="mb-4">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Emotions</span>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[8px] font-bold">Calm</span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[8px] font-bold">Focused</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-slate-400" />
                <span>London session</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag size={10} className="text-slate-400" />
                <span>Trend Continuation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Capital Curve & Metrics */}
          <div className="flex-1 flex flex-col justify-between p-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Account Metrics</span>
                <span className="bg-zinc-900 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">Pro Active</span>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 border border-slate-100 rounded p-3">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Win Rate</span>
                  <span className="text-sm font-extrabold text-slate-800">68.24%</span>
                </div>
                <div className="bg-slate-50/70 border border-slate-100 rounded p-3">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Hold Time</span>
                  <span className="text-sm font-extrabold text-slate-800">1.5 hrs</span>
                </div>
              </div>

              {/* Capital Curve Chart Box */}
              <div className="bg-slate-50/70 border border-slate-100 rounded p-4 flex flex-col justify-between h-36">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Account Capital Curve</span>
                  <span className="text-xs font-bold text-slate-850">$10,842.50</span>
                </div>
                <div className="h-20 w-full relative">
                  {/* Clean SVG Area chart */}
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-emerald-500 fill-emerald-500/5">
                    <path d="M0,30 L0,25 Q25,22 50,15 T100,5 L100,30 Z" className="fill-emerald-500/5" />
                    <path d="M0,25 Q25,22 50,15 T100,5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 text-[9px] font-bold text-slate-400 uppercase">
              <span>Next Execution Sync</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Syncing
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* --- DUAL MARKET ENGINE HIGHLIGHT (FOREX & FUTURES) --- */}
      <section className="py-10 bg-slate-50 border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                <Compass size={12} className="text-slate-700" />
                Asset-Class Specialized
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Engineered specifically for Forex and Futures traders.
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-xl">
                No generic spreadsheet calculations. The Pip Vault features native math engines tailored for exact Pip precision and Futures tick contracts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left min-w-[170px]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Forex Engine</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">10,000x Pip Multiplier</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">EUR/USD, GBP/USD & JPY</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Auto 2-decimal JPY scaling</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left min-w-[170px]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Futures Engine</span>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">1.0 Point Multiplier</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">ES, NQ, YM, GC & CL</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">True tick & point calculations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- IN-DEPTH INTERACTIVE CAPABILITIES SHOWCASE --- */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What The Pip Vault is capable of.
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">
              Explore the four institutional layers engineered to turn impulsive guesses into a verified, compounded mathematical edge.
            </p>

            {/* Tab Navigation Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/70 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab('journal')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'journal'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BookOpen size={14} />
                <span>Trade Journaling</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('psychology')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'psychology'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Brain size={14} />
                <span>Psychology & Leakage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BarChart3 size={14} />
                <span>Edge & Playbook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'accounts'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Wallet size={14} />
                <span>Multi-Account Vault</span>
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content Box */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm transition-all">
            
            {/* TAB 1: PRECISION JOURNALING */}
            {activeTab === 'journal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Sub-30-Second Logging
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Trade logging with instant risk-reward and fee intelligence.
                  </h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Capture every trade nuance in seconds. Automatic Risk:Reward calculation, fee deductions, and direct TradingView chart attachments mean you never skip a journal entry again.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Automatic Pip & Point Math</span>
                        <span className="text-[11px] text-slate-500 font-medium">Auto-scales multiplier between 10,000 for Forex, 100 for JPY, and 1.0 for Futures.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Commissions, Swap & Net PnL</span>
                        <span className="text-[11px] text-slate-500 font-medium">Separates gross profit from broker commission and swap costs so your net capital is true.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Breakeven & Trade Visuals</span>
                        <span className="text-[11px] text-slate-500 font-medium">One-tap Breakeven protection toggle and high-res chart screenshot linking.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card Preview */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-slate-900">Trade #1042 · EUR/USD</span>
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Forex</span>
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">LONG</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">+$960.00 Net</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Entry</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">1.08200</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Stop Loss</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">1.08050</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Take Profit</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">1.08710</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Gain / R:R</span>
                      <span className="text-xs font-bold text-emerald-700">+51.0 Pips (1:3.4)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-slate-600 text-[11px] font-semibold">
                      <span>Gross: <strong className="text-slate-900">+$965.00</strong></span>
                      <span>Commission: <strong className="text-slate-900">-$5.00</strong></span>
                      <span>Swap: <strong className="text-slate-900">$0.00</strong></span>
                    </div>
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      BE Protected
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Attributes:</span>
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">London Open</span>
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">Trend Continuation</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">Disciplined Mindset</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PSYCHOLOGY & EMOTIONAL LEAKAGE */}
            {activeTab === 'psychology' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-wider">
                    <Brain size={12} className="text-amber-400" />
                    Behavioral Analytics
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Pinpoint the exact dollar cost of emotional leakage.
                  </h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Most trading blowups aren't strategy failures — they are emotional spirals. The Pip Vault cross-references every trade with your emotional state so you can see where discipline leaks capital.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Emotional State Tagging</span>
                        <span className="text-[11px] text-slate-500 font-medium">Tag states like FOMO, Greed, Fear, Revenge, Confident, Patient, or Disciplined before and after every trade.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Dollar Leakage Quantification</span>
                        <span className="text-[11px] text-slate-500 font-medium">Instantly discover: "How much did impulsive revenge trades cost me this month in hard currency?"</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Discipline Index</span>
                        <span className="text-[11px] text-slate-500 font-medium">Calculate your rule compliance percentage and correlate discipline directly with your equity curve.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card Preview */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold uppercase text-slate-900">Emotional State vs. Capital Impact</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Last 30 Days</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">Disciplined & Patient</span>
                        <span className="text-xs font-extrabold text-emerald-700">+$6,420.00</span>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600">24 Trades · 75% Win Rate · 2.9 PF</div>
                      <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-red-50/70 border border-red-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-800">FOMO & Revenge Entries</span>
                        <span className="text-xs font-extrabold text-red-700">-$2,180.00</span>
                      </div>
                      <div className="text-[10px] font-semibold text-red-600">6 Trades · 16% Win Rate · 0.4 PF</div>
                      <div className="w-full bg-red-200/60 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full rounded-full" style={{ width: '16%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-white rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <AlertCircle size={14} />
                      <span>Vault Behavioral Diagnosis:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Eliminating emotional revenge executions after a loss would boost your net monthly yield by <strong className="text-white">+33.9%</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EDGE & PLAYBOOK ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-wider">
                    <BarChart3 size={12} className="text-blue-400" />
                    Expectancy Intelligence
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Know which setups feed you and which ones bleed you.
                  </h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Stop guessing your statistical edge. The Pip Vault segments your trades by strategy, market session, and direction to prove where your positive mathematical expectancy actually lies.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Setup-by-Setup Alpha</span>
                        <span className="text-[11px] text-slate-500 font-medium">Track Win Rate, Profit Factor, and Total Net PnL across your custom setups (Trend Continuation, Breakouts, Reversals).</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Session Timing Heatmaps</span>
                        <span className="text-[11px] text-slate-500 font-medium">Isolate performance by market hours (London, New York, Tokyo, Sydney) to identify your peak focus windows.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Directional Asymmetry</span>
                        <span className="text-[11px] text-slate-500 font-medium">Compare Long vs Short win rates to detect psychological or technical bias in trending environments.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card Preview */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold uppercase text-slate-900">Strategy Playbook Breakdown</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Overall PF: 2.31</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Trend Continuation</div>
                        <div className="text-[10px] text-slate-400 font-medium">42 Trades · London & NY</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">+$5,120.00 (71.4% WR)</div>
                        <div className="text-[10px] font-semibold text-slate-500">2.85 Profit Factor</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Breakout</div>
                        <div className="text-[10px] text-slate-400 font-medium">28 Trades · NY Session</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">+$2,840.00 (64.2% WR)</div>
                        <div className="text-[10px] font-semibold text-slate-500">2.10 Profit Factor</div>
                      </div>
                    </div>

                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Counter-Trend Reversal</div>
                        <div className="text-[10px] text-red-500 font-medium">14 Trades · Tokyo Session (Edge Leak)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">-$650.00 (35.7% WR)</div>
                        <div className="text-[10px] font-semibold text-red-500">0.81 Profit Factor</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Highest Expected Value Session:</span>
                    <span className="text-slate-900 font-bold">London Session (+$4,650 Net)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MULTI-ACCOUNT & PROP FIRM VAULT */}
            {activeTab === 'accounts' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-wider">
                    <Wallet size={12} className="text-emerald-400" />
                    Capital Centralization
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Manage all prop firm & broker accounts in one place.
                  </h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Stop maintaining separate spreadsheets for every prop challenge and live broker. Isolate drawdown limits, switch accounts seamlessly, and protect your evaluations.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Unified Account Vault</span>
                        <span className="text-[11px] text-slate-500 font-medium">Keep FTMO, Topstep, Funded, and personal live broker accounts organized side-by-side.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Drawdown & Rule Monitoring</span>
                        <span className="text-[11px] text-slate-500 font-medium">Track starting balance versus live equity curve so you never violate max loss limits.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Currency & Status Segregation</span>
                        <span className="text-[11px] text-slate-500 font-medium">Filter accounts by Active, Passed, or Blown with multi-currency support (USD, EUR, GBP, JPY).</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card Preview */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold uppercase text-slate-900">Active Trading Accounts</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">3 Portfolios Connected</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">FTMO $100K Funded</span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">Active</span>
                        <span className="text-[9px] font-bold bg-zinc-950 text-white px-1.5 py-0.2 rounded">Default</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">Start: $100,000 · Current: $108,420</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-600 block">+$8,420.00</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Max DD: -1.2% Safe</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Topstep $50K Futures</span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">Passed</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">Start: $50,000 · Current: $53,150</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-600 block">+$3,150.00</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Target Reached</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Personal Live (IC Markets)</span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">Active</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">Start: €10,000 · Current: €14,890</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-600 block">+€4,890.00</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">EUR Base</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* --- SIX CORE PILLARS GRID --- */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Systematic Architecture</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built for serious traders. Not gamblers.</h2>
            <p className="text-xs font-semibold text-slate-500 mt-2">Every feature exists to eliminate leaks and compound repeatable alpha.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Precision Math */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Target size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Automated Pip & Point Math</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Seamless switching between Forex 10,000 multiplier (with JPY auto-detection) and Futures 1.0 point ticks. Never calculate risk-reward on a napkin again.
              </p>
            </div>

            {/* 2. Behavioral Diagnostics */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Brain size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Behavioral Leakage Matrix</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Connect your psychological mindset directly with your PnL. The journal isolates exactly which emotions cost you real capital.
              </p>
            </div>

            {/* 3. Setup Attribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Playbook Setup Attribution</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Tag your strategies (Trend Continuation, Breakouts, Order Blocks). Measure win rate, expectancy, and profit factor for every setup.
              </p>
            </div>

            {/* 4. Session Timing */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Clock size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Market Session Intelligence</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Attribute every execution across London, New York, Tokyo, and Sydney. Find your statistical sweet spot and avoid dead market chop.
              </p>
            </div>

            {/* 5. Multi-Account Portfolio */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Prop Firm & Multi-Account Shield</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Keep funded evaluations and personal broker accounts strictly segregated. Track individual drawdown thresholds with real-time equity curves.
              </p>
            </div>

            {/* 6. Trading Calendar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Visual Calendar & Reflection</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Month-by-month green and red day heatmap. Log daily reflections, market conditions, and personal execution scores to maintain consistency.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS: THE 3-STEP SYSTEMATIC WORKFLOW --- */}
      <section className="py-20 bg-white border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Daily Routine</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How profitable traders use the vault.</h2>
            <p className="text-xs font-semibold text-slate-500 mt-2">A 3-step loop executed every single trading day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 relative">
              <div className="text-3xl font-extrabold text-slate-200 mb-3">01</div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Log in under 30 seconds</h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Enter entry, exit, stop loss, and target. The engine computes your pips/points, R:R ratio, and net profit after fees automatically.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 relative">
              <div className="text-3xl font-extrabold text-slate-200 mb-3">02</div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Tag mindset & setup</h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Record your pre-trade emotion and playbook setup. Tag whether you stuck to your plan or let impatience trigger a premature entry.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 relative">
              <div className="text-3xl font-extrabold text-slate-200 mb-3">03</div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Review & cut leaks</h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                At the end of the week, examine your leakage score. Eliminate your 2 worst behaviors and watch your net profitability surge.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Analytics Showcase Section */}
      <section id="analytics" className="py-20 bg-slate-50 border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block font-semibold">Deep Analytics</span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Analytics that help you operate.</h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mt-2">
                Evaluate metrics at speed. Track performance curves, win ratios, and risk parameters from your dashboard.
              </p>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2"><Check size={14} className="text-zinc-950" /> Automated win/loss ratio evaluations</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-zinc-950" /> Advanced strategy edge indicators</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-zinc-950" /> Micro-risk parameter guards</li>
            </ul>
          </div>

          {/* Right Column Analytics Grid */}
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Total Trades</span>
                <div className="text-xl font-extrabold text-slate-900 my-1">28,392</div>
                {/* SVG sparkline */}
                <div className="h-6 w-full mt-2">
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-emerald-500">
                    <path d="M0,20 L20,18 L40,15 L60,10 L80,12 L100,5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Win Rate</span>
                <div className="text-xl font-extrabold text-slate-900 my-1">68.24%</div>
                {/* SVG sparkline */}
                <div className="h-6 w-full mt-2">
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-emerald-500">
                    <path d="M0,20 L20,15 L40,18 L60,12 L80,8 L100,4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Profit Factor</span>
                <div className="text-xl font-extrabold text-slate-900 my-1">2.31</div>
                <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-zinc-950 rounded-full" style={{ width: '77%' }} />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Executions today</span>
                <div className="text-xl font-extrabold text-slate-900 my-1">12</div>
                <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-zinc-950 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Pricing built for the long game</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-16">Free during beta. Lock in early-trader pricing forever.</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            
            {/* Starter */}
            <div className="bg-white border border-slate-200 rounded-md p-6 text-left flex flex-col justify-between shadow-sm hover:border-slate-355 transition-all">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Starter</h3>
                <p className="text-[10px] font-medium text-slate-400 mb-4">Everything you need to journal seriously.</p>
                <div className="text-2xl font-extrabold text-slate-900 mb-6">$0<span className="text-xs text-slate-400 font-semibold">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Unlimited trades</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Psychological tagging</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Core analytics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> 1 trading account</li>
                </ul>
              </div>
              <Link href="/register" className="w-full text-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 text-xs transition-colors">
                Get started
              </Link>
            </div>

            {/* Pro Trader */}
            <div className="bg-white border-2 border-zinc-950 rounded-md p-6 text-left flex flex-col justify-between shadow-sm relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-zinc-950 text-white text-[8px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-zinc-900">
                Most Popular
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Pro Trader</h3>
                <p className="text-[10px] font-medium text-slate-400 mb-4">For serious traders and prop-firm hopefuls.</p>
                <div className="text-2xl font-extrabold text-slate-900 mb-6">$19<span className="text-xs text-slate-400 font-semibold">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Everything in Starter</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Unlimited accounts (funded, live)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Emotional leakage analytics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Advanced strategy setup breakdown</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Chart screenshots</li>
                </ul>
              </div>
              <Link href="/register" className="w-full text-center rounded bg-zinc-900 hover:bg-black text-white font-semibold py-2 text-xs transition-colors shadow-sm">
                Start Pro free
              </Link>
            </div>

            {/* Team Workspace */}
            <div className="bg-white border border-slate-200 rounded-md p-6 text-left flex flex-col justify-between shadow-sm hover:border-slate-355 transition-all">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Business</h3>
                <p className="text-[10px] font-medium text-slate-400 mb-4">For team-based accounts and prop groups.</p>
                <div className="text-2xl font-extrabold text-slate-900 mb-6">$49<span className="text-xs text-slate-400 font-semibold">/mo</span></div>
                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Group account workspaces</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Multi-account sync integrations</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Custom data exporting</li>
                </ul>
              </div>
              <Link href="/register" className="w-full text-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 text-xs transition-colors">
                Get started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-slate-200 rounded-md p-6 text-left flex flex-col justify-between shadow-sm hover:border-slate-355 transition-all">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Enterprise</h3>
                <p className="text-[10px] font-medium text-slate-400 mb-4">For corporate capital and large firms.</p>
                <div className="text-2xl font-extrabold text-slate-900 mb-6">Custom</div>
                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Dedicated database cluster</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Custom API integrations</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Custom contract onboarding</li>
                </ul>
              </div>
              <a href="mailto:support@example.com" className="w-full text-center rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2 text-xs transition-colors shadow-sm">
                Contact sales
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto w-full">
        <div className="bg-zinc-950 rounded-md border border-zinc-900 p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          {/* Subtle light leak */}
          <div className="absolute top-0 left-1/4 w-full h-full bg-zinc-900/40 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-white">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">Ready to run your journal like a system?</h2>
              <p className="text-xs font-semibold text-zinc-550 mt-1">Join active traders who automate logs with confidence.</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link 
              href="/register"
              className="rounded bg-white hover:bg-slate-100 text-zinc-900 px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              Get started for free
            </Link>
            <a 
              href="#pricing"
              className="rounded bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-semibold transition-all"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6 text-zinc-500 text-xs mt-auto">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-white font-bold text-[10px]">P</div>
            <span className="font-bold text-zinc-200">ThePipVault</span>
          </div>
          
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider">
            <a href="#features" className="hover:text-zinc-350">Features</a>
            <a href="#analytics" className="hover:text-zinc-350">Analytics</a>
            <a href="#pricing" className="hover:text-zinc-350">Pricing</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} The Pip Vault. Built for traders who do the work.
          </div>
        </div>
      </footer>

    </div>
  );
}