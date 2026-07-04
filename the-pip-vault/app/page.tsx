// src/app/page.tsx
"use client";

import Link from "next/link";
import { Activity, Target, Shield, ArrowRight, CheckCircle2, TrendingUp, Cpu, Layers, Terminal, Check, Brain, Users, Clock, Tag } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans antialiased text-[#0f172a] relative">
      
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
        
        {/* Status Indicator */}
        <div className="mb-6 flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-sm uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System status: All systems operational
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

      {/* Feature Section (Pillars Grid) */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/60 px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Systematic Execution</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Built for the work behind the wins.</h2>
            <p className="text-xs font-semibold text-slate-400 uppercase mt-2">Three pillars. One disciplined process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-5 text-left shadow-sm">
              <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 text-white flex items-center justify-center mb-4">
                <Brain size={14} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Psychological tagging</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Tag every trade with mindset and emotion. Find the patterns that hurt you most.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-5 text-left shadow-sm">
              <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 text-white flex items-center justify-center mb-4">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Performance analytics</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Win rate, expectancy, R-multiple distribution, and emotional leakage points.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-5 text-left shadow-sm">
              <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 text-white flex items-center justify-center mb-4">
                <Users size={14} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Mentorship groups</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Mentors review students' journals, set goals, and grade homework — all in one vault.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-5 text-left shadow-sm">
              <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 text-white flex items-center justify-center mb-4">
                <Shield size={14} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Risk Evaluation</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Automatically verify risk-reward limits, stop losses, and take profit margins.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-5 text-left shadow-sm">
              <div className="h-7 w-7 rounded bg-zinc-950 border border-zinc-900 text-white flex items-center justify-center mb-4">
                <Cpu size={14} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Command Center</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Integrate multi-account tracking and strategy edge metrics in one screen.
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
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-zinc-950" /> Mentorship groups</li>
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