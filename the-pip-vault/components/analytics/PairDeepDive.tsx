// src/components/analytics/PairDeepDive.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Trade } from "@/types/database";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Target, 
  Award, 
  Clock, 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Calendar, 
  SlidersHorizontal,
  Layers,
  BarChart2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Compass,
  CheckCircle2,
  XCircle,
  Brain,
  Filter
} from "lucide-react";

export interface PairStats {
  pair: string;
  total: number;
  wins: number;
  losses: number;
  be: number;
  winRate: number;
  pnl: number;
  grossWin: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  longCount: number;
  shortCount: number;
  longWins: number;
  shortWins: number;
  longPnl: number;
  shortPnl: number;
  longWinRate: number;
  shortWinRate: number;
  bestTrade: number;
  worstTrade: number;
  fees: number;
  volumeShare: number;
  bestSession: string;
  bestStrategy: string;
  avgHoldTimeStr: string;
  trades: Trade[];
  sessions: Record<string, { total: number; wins: number; pnl: number }>;
  strategies: Record<string, { total: number; wins: number; pnl: number }>;
  weekdays: Record<string, { total: number; wins: number; pnl: number }>;
  assetType?: string;
}

interface PairDeepDiveProps {
  allTradedPairs: PairStats[];
  initialPair?: string;
}

// Helper to format hold duration
const formatDuration = (ms: number) => {
  if (!ms || ms <= 0) return "N/A";
  const mins = Math.floor(ms / (1000 * 60));
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${mins}m`;
};

// Helper to format currency properly with negative sign before dollar
const formatMoney = (val: number, showSign = true) => {
  const isNeg = val < 0;
  const abs = Math.abs(val).toFixed(2);
  if (!showSign) return `$${abs}`;
  if (val > 0) return `+$${abs}`;
  if (isNeg) return `-$${abs}`;
  return `$${abs}`;
};

export default function PairDeepDive({
  allTradedPairs,
  initialPair,
}: PairDeepDiveProps) {
  const [selectedPair, setSelectedPair] = useState<string>(
    initialPair || allTradedPairs[0]?.pair || ""
  );
  const [activeTab, setActiveTab] = useState<'deep' | 'matrix'>('deep');
  const [inspectorSubTab, setInspectorSubTab] = useState<'sessions' | 'strategies' | 'psychology' | 'trades'>('sessions');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<'total' | 'pnl' | 'winRate' | 'profitFactor'>('pnl');
  const [sortAsc, setSortAsc] = useState(false);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'LONG' | 'SHORT' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Active pair details
  const activePair = useMemo(() => {
    if (!selectedPair) return allTradedPairs[0] || null;
    return allTradedPairs.find(p => p.pair.toUpperCase() === selectedPair.toUpperCase()) || allTradedPairs[0] || null;
  }, [allTradedPairs, selectedPair]);

  // Filtered pairs for ticker strip & table
  const filteredPairs = useMemo(() => {
    return allTradedPairs
      .filter(p => p.pair.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [allTradedPairs, searchQuery, sortField, sortAsc]);

  // Cumulative P&L curve & Drawdown for active pair
  const pairChartData = useMemo(() => {
    if (!activePair || activePair.trades.length === 0) return null;

    const sorted = [...activePair.trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulative = 0;
    let peak = 0;
    let maxDd = 0;
    const points = [{ date: "Start", pnl: 0, cumulative: 0, setup: "", session: "", direction: "" }];

    sorted.forEach((t) => {
      cumulative += (t.pnl || 0);
      if (cumulative > peak) peak = cumulative;
      const dd = peak - cumulative;
      if (dd > maxDd) maxDd = dd;

      points.push({
        date: t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        pnl: t.pnl || 0,
        cumulative,
        setup: t.setup || "Unspecified",
        session: t.session || "Unspecified",
        direction: t.direction
      });
    });

    const values = points.map(p => p.cumulative);
    const maxVal = Math.max(...values, 0);
    const minVal = Math.min(...values, 0);
    const range = (maxVal - minVal) || 1;

    const len = Math.max(1, points.length - 1);
    const getX = (i: number) => (i / len) * 600;
    const getY = (val: number) => 150 - ((val - minVal) / range) * 120;

    let path = "";
    let area = "";

    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.cumulative);
      if (i === 0) {
        path += `M ${x.toFixed(1)},${y.toFixed(1)}`;
        area += `M ${x.toFixed(1)},160 L ${x.toFixed(1)},${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        area += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
      }
      if (i === points.length - 1) {
        area += ` L ${x.toFixed(1)},160 Z`;
      }
    });

    const finalPnl = points[points.length - 1].cumulative;
    const zeroY = getY(0);

    return {
      points,
      path,
      area,
      finalPnl,
      isProfit: finalPnl >= 0,
      zeroY,
      getX,
      getY,
      maxVal,
      minVal,
      peak,
      maxDd
    };
  }, [activePair]);

  // Deep metrics: Streaks (Win & Loss)
  const streakMetrics = useMemo(() => {
    if (!activePair || activePair.trades.length === 0) {
      return { maxWinStreak: 0, maxLossStreak: 0, currentStreak: { type: 'NONE', count: 0 } };
    }
    const chronological = [...activePair.trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxWin = 0;
    let maxLoss = 0;
    let currentWin = 0;
    let currentLoss = 0;

    chronological.forEach((t) => {
      if (t.is_breakeven) {
        // Breakeven doesn't increment win or loss streak
      } else if (t.pnl > 0) {
        currentWin += 1;
        currentLoss = 0;
        if (currentWin > maxWin) maxWin = currentWin;
      } else if (t.pnl < 0) {
        currentLoss += 1;
        currentWin = 0;
        if (currentLoss > maxLoss) maxLoss = currentLoss;
      }
    });

    // Current streak from the end
    let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
    let streakCount = 0;
    for (let i = chronological.length - 1; i >= 0; i--) {
      const t = chronological[i];
      if (t.is_breakeven) continue;
      const isW = t.pnl > 0;
      if (streakType === 'NONE') {
        streakType = isW ? 'WIN' : 'LOSS';
        streakCount = 1;
      } else if ((streakType === 'WIN' && isW) || (streakType === 'LOSS' && !isW)) {
        streakCount += 1;
      } else {
        break;
      }
    }

    return { maxWinStreak: maxWin, maxLossStreak: maxLoss, currentStreak: { type: streakType, count: streakCount } };
  }, [activePair]);

  // Deep metrics: Hold Time on Winners vs Losers
  const holdTimeAnalysis = useMemo(() => {
    if (!activePair || activePair.trades.length === 0) {
      return { avgWinnerHold: "N/A", avgLoserHold: "N/A", loserHeldLonger: false, ratio: "1.0" };
    }
    let winMs = 0;
    let winCount = 0;
    let lossMs = 0;
    let lossCount = 0;

    activePair.trades.forEach((t) => {
      if (t.date && t.exit_date) {
        const diff = new Date(t.exit_date).getTime() - new Date(t.date).getTime();
        if (diff > 0) {
          if (!t.is_breakeven && t.pnl > 0) {
            winMs += diff;
            winCount += 1;
          } else if (!t.is_breakeven && t.pnl < 0) {
            lossMs += diff;
            lossCount += 1;
          }
        }
      }
    });

    const avgWinMs = winCount > 0 ? winMs / winCount : 0;
    const avgLossMs = lossCount > 0 ? lossMs / lossCount : 0;

    return {
      avgWinnerHold: winCount > 0 ? formatDuration(avgWinMs) : "N/A",
      avgLoserHold: lossCount > 0 ? formatDuration(avgLossMs) : "N/A",
      loserHeldLonger: avgLossMs > avgWinMs && winCount > 0 && lossCount > 0,
      ratio: avgWinMs > 0 ? (avgLossMs / avgWinMs).toFixed(1) : "1.0",
    };
  }, [activePair]);

  // Deep metrics: Realized Risk:Reward & Payoff Ratio
  const rrMetrics = useMemo(() => {
    if (!activePair) return { avgRR: 0, maxRR: 0, payoffRatio: 0 };
    const validRR = activePair.trades
      .filter(t => t.rr_ratio !== null && t.rr_ratio !== undefined && t.rr_ratio > 0)
      .map(t => t.rr_ratio as number);

    const avgRR = validRR.length > 0 ? validRR.reduce((a, b) => a + b, 0) / validRR.length : 0;
    const maxRR = validRR.length > 0 ? Math.max(...validRR) : 0;
    const payoffRatio = activePair.avgLoss > 0 ? activePair.avgWin / activePair.avgLoss : 0;

    return { avgRR, maxRR, payoffRatio };
  }, [activePair]);

  // Deep metrics: Psychology & Emotions on this pair
  const emotionsBreakdown = useMemo(() => {
    if (!activePair) return [];
    const map: Record<string, { emotion: string; total: number; wins: number; pnl: number }> = {};
    activePair.trades.forEach((t) => {
      const em = t.emotion || "Neutral";
      if (!map[em]) map[em] = { emotion: em, total: 0, wins: 0, pnl: 0 };
      map[em].total += 1;
      map[em].pnl += (t.pnl || 0);
      if (!t.is_breakeven && t.pnl > 0) map[em].wins += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [activePair]);

  // Deep metrics: Best & Worst Trade full records
  const tradeExtremes = useMemo(() => {
    if (!activePair || activePair.trades.length === 0) return { best: null, worst: null };
    const sorted = [...activePair.trades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    const best = sorted[0]?.pnl > 0 ? sorted[0] : null;
    const worst = sorted[sorted.length - 1]?.pnl < 0 ? sorted[sorted.length - 1] : null;
    return { best, worst };
  }, [activePair]);

  // Directional Breakdown (Long vs Short detailed calculations)
  const directionalStats = useMemo(() => {
    if (!activePair) return null;
    const longTrades = activePair.trades.filter(t => t.direction === 'LONG');
    const shortTrades = activePair.trades.filter(t => t.direction === 'SHORT');

    const calcGroup = (group: Trade[]) => {
      const total = group.length;
      const be = group.filter(t => t.is_breakeven).length;
      const nonBe = total - be;
      const wins = group.filter(t => !t.is_breakeven && t.pnl > 0);
      const losses = group.filter(t => !t.is_breakeven && t.pnl < 0);
      const winCount = wins.length;
      const lossCount = losses.length;
      const winRate = nonBe > 0 ? (winCount / nonBe) * 100 : 0;
      const pnl = group.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossWin = wins.reduce((acc, t) => acc + t.pnl, 0);
      const grossLoss = losses.reduce((acc, t) => acc + Math.abs(t.pnl), 0);
      const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
      const avgWin = winCount > 0 ? grossWin / winCount : 0;
      const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;

      return { total, be, winCount, lossCount, winRate, pnl, grossWin, grossLoss, profitFactor, avgWin, avgLoss };
    };

    return {
      long: calcGroup(longTrades),
      short: calcGroup(shortTrades)
    };
  }, [activePair]);

  // Filtered trade log for active pair
  const pairFilteredTrades = useMemo(() => {
    if (!activePair) return [];
    return activePair.trades.filter((t) => {
      if (tradeFilter === 'LONG') return t.direction === 'LONG';
      if (tradeFilter === 'SHORT') return t.direction === 'SHORT';
      if (tradeFilter === 'WIN') return !t.is_breakeven && t.pnl > 0;
      if (tradeFilter === 'LOSS') return !t.is_breakeven && t.pnl < 0;
      if (tradeFilter === 'BE') return t.is_breakeven;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activePair, tradeFilter]);

  if (allTradedPairs.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center text-zinc-400 text-xs shadow-xs mt-10">
        <Coins size={32} className="mx-auto text-zinc-300 mb-2.5" />
        <p className="font-semibold text-zinc-700 text-sm">No Traded Pairs Recorded Yet</p>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm mx-auto">
          Add your executions in the trading journal to generate pair performance analytics, directional bias, and session statistics.
        </p>
      </div>
    );
  }

  // Best performing & highest volume pair summary
  const bestPerformingPair = [...allTradedPairs].sort((a, b) => b.pnl - a.pnl)[0];
  const mostTradedPair = [...allTradedPairs].sort((a, b) => b.total - a.total)[0];

  return (
    <section className="space-y-6 pt-8 border-t border-zinc-200 mt-10">
      
      {/* --- SECTION HEADER WITH METRIC PILLS --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-950 text-white shadow-xs">
              <Coins size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
              Traded Pairs Performance & Deep Analytics
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Institutional-grade quantitative analysis per asset: directional bias, session edge, setup matrix, and execution diagnostics.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {bestPerformingPair && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 shadow-2xs">
              <Sparkles size={13} className="text-emerald-600" />
              <span className="text-zinc-400 text-[11px] font-medium">Top Asset:</span>
              <strong className="text-zinc-900 font-semibold">{bestPerformingPair.pair}</strong>
              <span className={`font-mono text-[11px] font-bold ${bestPerformingPair.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatMoney(bestPerformingPair.pnl)}
              </span>
            </div>
          )}

          {mostTradedPair && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 shadow-2xs">
              <Activity size={13} className="text-zinc-500" />
              <span className="text-zinc-400 text-[11px] font-medium">Most Active:</span>
              <strong className="text-zinc-900 font-semibold">{mostTradedPair.pair}</strong>
              <span className="text-[11px] text-zinc-500 font-mono">({mostTradedPair.total} trades)</span>
            </div>
          )}

          {/* View Mode Toggle: Deep Studio vs Comparison Matrix */}
          <div className="flex bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab('deep')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deep' 
                  ? 'bg-zinc-950 text-white shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Target size={13} />
              <span>Asset Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix' 
                  ? 'bg-zinc-950 text-white shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Comparison Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- ASSET SELECTOR STRIP --- */}
      <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Symbol:</span>
            <span className="text-xs text-zinc-500 font-medium">Choose any traded pair to inspect deep metrics</span>
          </div>

          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter symbols..."
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded-md bg-zinc-50 border border-zinc-200 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400 transition-all font-medium"
            />
          </div>
        </div>

        {/* Ticker Buttons Grid / Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredPairs.map((p) => {
            const isSelected = activePair?.pair === p.pair;
            const isPos = p.pnl >= 0;

            return (
              <button
                key={p.pair}
                type="button"
                onClick={() => {
                  setSelectedPair(p.pair);
                  setActiveTab('deep');
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-left shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/20'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs tracking-tight font-mono">{p.pair}</span>
                    {p.assetType && (
                      <span className={`text-[8px] font-bold uppercase px-1 py-0.2 rounded ${
                        isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {p.assetType}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-medium mt-0.5 ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {p.total} {p.total === 1 ? 'trade' : 'trades'} · {p.winRate.toFixed(0)}% WR
                  </div>
                </div>

                <div className={`font-mono text-xs font-bold tabular-nums pl-1 text-right ${
                  isSelected
                    ? isPos ? 'text-emerald-400' : 'text-rose-400'
                    : isPos ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatMoney(p.pnl)}
                </div>
              </button>
            );
          })}

          {filteredPairs.length === 0 && (
            <div className="text-xs text-zinc-400 italic py-2 px-3">
              No symbols match "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* --- TAB 1: ASSET DEEP STUDIO (FOCUSED VIEW) --- */}
      {activeTab === 'deep' && activePair && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Symbol Header Card with Top Financial KPIs */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 lg:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950 text-white font-mono font-bold text-base shadow-sm">
                  {activePair.pair.slice(0, 3)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold text-zinc-950 tracking-tight font-mono">
                      {activePair.pair}
                    </h3>
                    {activePair.assetType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                        {activePair.assetType}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono tabular-nums ${
                      activePair.pnl >= 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {formatMoney(activePair.pnl)} Net Return
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1 font-medium">
                    <span>{activePair.total} total executions</span>
                    <span>•</span>
                    <span>{activePair.volumeShare.toFixed(1)}% portfolio volume</span>
                    <span>•</span>
                    <span>Avg Hold: {activePair.avgHoldTimeStr}</span>
                    {activePair.fees > 0 && (
                      <>
                        <span>•</span>
                        <span>Fees: -${activePair.fees.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Record Pill & Streak Badge */}
              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                <div className="px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 font-mono">
                  <span className="text-emerald-600 font-bold">{activePair.wins}W</span>
                  <span className="text-zinc-300 mx-1.5">/</span>
                  <span className="text-rose-600 font-bold">{activePair.losses}L</span>
                  {activePair.be > 0 && (
                    <>
                      <span className="text-zinc-300 mx-1.5">/</span>
                      <span className="text-blue-600 font-bold">{activePair.be}BE</span>
                    </>
                  )}
                </div>

                {streakMetrics.currentStreak.type !== 'NONE' && (
                  <div className={`px-2.5 py-1.5 rounded-md border text-xs font-bold font-mono flex items-center gap-1.5 ${
                    streakMetrics.currentStreak.type === 'WIN'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <Zap size={12} />
                    <span>Streak: {streakMetrics.currentStreak.count}{streakMetrics.currentStreak.type === 'WIN' ? 'W' : 'L'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive 8-KPI Mathematical Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">
              
              {/* 1. Net P&L */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Net P&L</div>
                <div className={`text-base font-bold font-mono mt-1 ${activePair.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatMoney(activePair.pnl)}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Gross: +${activePair.grossWin.toFixed(0)}
                </div>
              </div>

              {/* 2. Win Rate */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Win Rate</div>
                <div className="text-base font-bold text-zinc-900 font-mono mt-1">
                  {activePair.winRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {activePair.wins} of {activePair.total - activePair.be} decisive
                </div>
              </div>

              {/* 3. Profit Factor */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Profit Factor</div>
                <div className={`text-base font-bold font-mono mt-1 ${
                  activePair.profitFactor >= 1.5 ? 'text-emerald-600' : activePair.profitFactor >= 1 ? 'text-zinc-900' : 'text-rose-600'
                }`}>
                  {activePair.profitFactor === Infinity ? 'MAX' : activePair.profitFactor > 0 ? activePair.profitFactor.toFixed(2) : '-'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Loss: -${activePair.grossLoss.toFixed(0)}
                </div>
              </div>

              {/* 4. Expectancy (EV) */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Expectancy</div>
                <div className={`text-base font-bold font-mono mt-1 ${activePair.expectancy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatMoney(activePair.expectancy)}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Per trade EV</div>
              </div>

              {/* 5. Payoff Ratio */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payoff Ratio</div>
                <div className="text-base font-bold text-zinc-900 font-mono mt-1">
                  {rrMetrics.payoffRatio > 0 ? `${rrMetrics.payoffRatio.toFixed(2)}:1` : 'N/A'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Avg W / Avg L</div>
              </div>

              {/* 6. Avg Win / Loss */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Win / Loss</div>
                <div className="text-xs font-bold font-mono mt-1.5 flex items-center justify-between">
                  <span className="text-emerald-600">+${activePair.avgWin.toFixed(0)}</span>
                  <span className="text-zinc-300">/</span>
                  <span className="text-rose-600">-${activePair.avgLoss.toFixed(0)}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Average impact</div>
              </div>

              {/* 7. Best Streaks */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Max Streaks</div>
                <div className="text-xs font-bold font-mono mt-1.5 flex items-center justify-between">
                  <span className="text-emerald-600">{streakMetrics.maxWinStreak}W</span>
                  <span className="text-zinc-300">/</span>
                  <span className="text-rose-600">{streakMetrics.maxLossStreak}L</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Peak sequences</div>
              </div>

              {/* 8. Extremes (Best/Worst) */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Extremes</div>
                <div className="text-xs font-bold font-mono mt-1.5 flex items-center justify-between">
                  <span className="text-emerald-600">+${activePair.bestTrade.toFixed(0)}</span>
                  <span className="text-zinc-300">/</span>
                  <span className="text-rose-600">-${Math.abs(activePair.worstTrade).toFixed(0)}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Single execution</div>
              </div>

            </div>

            {/* Smart Edge Diagnosis Pill */}
            <div className="mt-4 p-3 rounded-md bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded bg-zinc-800 text-amber-400">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="font-bold text-zinc-100">Asset Edge Diagnosis:</span>
                  <span className="text-zinc-300 ml-1.5">
                    {activePair.pnl > 0 && activePair.winRate >= 50
                      ? `${activePair.pair} shows strong profitability with ${activePair.winRate.toFixed(0)}% win rate. Best performance in ${activePair.bestSession} session.`
                      : activePair.pnl < 0
                      ? `${activePair.pair} is currently running at a deficit (-$${Math.abs(activePair.pnl).toFixed(2)}). Consider refining setup selection or reducing position sizing.`
                      : `${activePair.pair} shows balanced performance across ${activePair.total} recorded executions.`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-zinc-400">
                <span>Best Setup: <strong className="text-white">{activePair.bestStrategy}</strong></span>
                <span>•</span>
                <span>Best Session: <strong className="text-white">{activePair.bestSession}</strong></span>
              </div>
            </div>

          </div>

          {/* --- ROW 2: DIRECTIONAL BIAS STUDIO & CUMULATIVE TRAJECTORY --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Long vs Short Directional Studio (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-zinc-800" />
                    <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                      Directional Bias Studio
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Long vs Short Asymmetry
                  </span>
                </div>

                {/* Long vs Short Comparison Cards */}
                {directionalStats && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    
                    {/* LONG STUDIO */}
                    <div className={`p-3.5 rounded-lg border transition-all ${
                      directionalStats.long.pnl >= 0 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : 'bg-zinc-50 border-zinc-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <ArrowUpRight size={14} /> LONG
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-zinc-500">
                          {directionalStats.long.total} trades ({activePair.total > 0 ? ((directionalStats.long.total / activePair.total) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      
                      <div className="text-lg font-bold font-mono tracking-tight text-zinc-900">
                        {formatMoney(directionalStats.long.pnl)}
                      </div>
                      
                      <div className="mt-3 space-y-1.5 text-[11px] font-medium text-zinc-600 border-t border-zinc-200/60 pt-2.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Win Rate:</span>
                          <span className="font-bold text-zinc-800 font-mono">{directionalStats.long.winRate.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Record:</span>
                          <span className="font-mono">{directionalStats.long.winCount}W / {directionalStats.long.lossCount}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Profit Factor:</span>
                          <span className="font-mono font-semibold">{directionalStats.long.profitFactor === Infinity ? 'MAX' : directionalStats.long.profitFactor > 0 ? directionalStats.long.profitFactor.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Avg Win:</span>
                          <span className="font-mono text-emerald-600">+${directionalStats.long.avgWin.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* SHORT STUDIO */}
                    <div className={`p-3.5 rounded-lg border transition-all ${
                      directionalStats.short.pnl >= 0 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : 'bg-zinc-50 border-zinc-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-700">
                          <ArrowDownRight size={14} /> SHORT
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-zinc-500">
                          {directionalStats.short.total} trades ({activePair.total > 0 ? ((directionalStats.short.total / activePair.total) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      
                      <div className="text-lg font-bold font-mono tracking-tight text-zinc-900">
                        {formatMoney(directionalStats.short.pnl)}
                      </div>
                      
                      <div className="mt-3 space-y-1.5 text-[11px] font-medium text-zinc-600 border-t border-zinc-200/60 pt-2.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Win Rate:</span>
                          <span className="font-bold text-zinc-800 font-mono">{directionalStats.short.winRate.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Record:</span>
                          <span className="font-mono">{directionalStats.short.winCount}W / {directionalStats.short.lossCount}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Profit Factor:</span>
                          <span className="font-mono font-semibold">{directionalStats.short.profitFactor === Infinity ? 'MAX' : directionalStats.short.profitFactor > 0 ? directionalStats.short.profitFactor.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Avg Win:</span>
                          <span className="font-mono text-emerald-600">+${directionalStats.short.avgWin.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Volume Distribution Visualizer Bar */}
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <div className="flex justify-between text-[11px] font-semibold text-zinc-500 mb-1.5">
                  <span className="text-emerald-700">Longs: {activePair.longCount}</span>
                  <span className="text-zinc-400 text-[10px]">Volume Distribution</span>
                  <span className="text-rose-700">Shorts: {activePair.shortCount}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-zinc-100">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${activePair.total > 0 ? (activePair.longCount / activePair.total) * 100 : 50}%` }}
                  />
                  <div 
                    className="h-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${activePair.total > 0 ? (activePair.shortCount / activePair.total) * 100 : 50}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Asset Trajectory & Cumulative Equity Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-zinc-800" />
                    <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                      Cumulative P&L Curve ({activePair.pair})
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    {pairChartData && (
                      <>
                        <span className="text-zinc-400">Max DD: <strong className="text-rose-600 font-bold">-${pairChartData.maxDd.toFixed(2)}</strong></span>
                        <span className="text-zinc-400">Peak: <strong className="text-emerald-600 font-bold">+${pairChartData.peak.toFixed(2)}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* SVG Curve Canvas */}
                <div className="relative mt-4 h-44 w-full flex items-center justify-center">
                  {pairChartData ? (
                    <div className="w-full h-full relative">
                      <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="assetCurveProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="assetCurveLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Baseline Zero Line */}
                        <line
                          x1="0"
                          y1={pairChartData.zeroY}
                          x2="600"
                          y2={pairChartData.zeroY}
                          stroke="#cbd5e1"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />

                        {/* Shaded Area */}
                        <path
                          d={pairChartData.area}
                          fill={pairChartData.isProfit ? "url(#assetCurveProfit)" : "url(#assetCurveLoss)"}
                        />

                        {/* The Stroke Line */}
                        <path
                          d={pairChartData.path}
                          fill="none"
                          stroke={pairChartData.isProfit ? "#059669" : "#e11d48"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data Points on Hover */}
                        {pairChartData.points.map((pt, i) => {
                          const x = pairChartData.getX(i);
                          const y = pairChartData.getY(pt.cumulative);
                          const isHovered = hoveredPointIndex === i;

                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 5 : 2.5}
                                className={pairChartData.isProfit ? "fill-emerald-600" : "fill-rose-600"}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2 : 1}
                              />
                              <rect
                                x={x - 12}
                                y="0"
                                width="24"
                                height="160"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPointIndex(i)}
                                onMouseLeave={() => setHoveredPointIndex(null)}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip on Hover */}
                      {hoveredPointIndex !== null && pairChartData.points[hoveredPointIndex] && (
                        <div 
                          className="absolute z-20 pointer-events-none bg-zinc-950 text-white rounded-md p-2 text-[11px] shadow-lg border border-zinc-800 font-mono -translate-x-1/2 -translate-y-full -top-1"
                          style={{ left: `${(hoveredPointIndex / Math.max(1, pairChartData.points.length - 1)) * 100}%` }}
                        >
                          <div className="font-bold text-zinc-100 flex items-center justify-between gap-3">
                            <span>{pairChartData.points[hoveredPointIndex].date || "Trade"}</span>
                            <span className={pairChartData.points[hoveredPointIndex].cumulative >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              Cum: {formatMoney(pairChartData.points[hoveredPointIndex].cumulative)}
                            </span>
                          </div>
                          {hoveredPointIndex > 0 && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              Trade: {formatMoney(pairChartData.points[hoveredPointIndex].pnl)} ({pairChartData.points[hoveredPointIndex].setup})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400">No chart points available</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-3 border-t border-zinc-100 mt-2">
                <span>Start: $0.00</span>
                <span>Active Trajectory</span>
                <span className={`font-bold ${activePair.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Current: {formatMoney(activePair.pnl)}
                </span>
              </div>
            </div>

          </div>

          {/* --- ROW 3: DEEP ANALYTICAL INSPECTOR CONTAINER WITH SUB-TABS --- */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
            
            {/* Inspector Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-md border border-zinc-200">
                
                <button
                  type="button"
                  onClick={() => setInspectorSubTab('sessions')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    inspectorSubTab === 'sessions'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Clock size={13} />
                  <span>Sessions & Timing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorSubTab('strategies')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    inspectorSubTab === 'strategies'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Target size={13} />
                  <span>Strategy Matrix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorSubTab('psychology')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    inspectorSubTab === 'psychology'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Brain size={13} />
                  <span>Risk & Psychology</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorSubTab('trades')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    inspectorSubTab === 'trades'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Layers size={13} />
                  <span>Trade Log ({activePair.total})</span>
                </button>

              </div>

              <div className="text-[11px] text-zinc-400 font-medium">
                Detailed breakdowns calculated exclusively for <strong className="text-zinc-800 font-mono">{activePair.pair}</strong>
              </div>
            </div>

            {/* --- SUB-TAB 1: SESSIONS & TIMING --- */}
            {inspectorSubTab === 'sessions' && (
              <div className="pt-4 space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Sessions Breakdown Table (7 Cols) */}
                  <div className="lg:col-span-7">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                      <Clock size={13} /> Execution Sessions on {activePair.pair}
                    </h5>

                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Session</th>
                            <th className="py-2.5 px-3 text-center">Trades</th>
                            <th className="py-2.5 px-3 text-center">Win Rate</th>
                            <th className="py-2.5 px-3 text-right">Net P&L</th>
                            <th className="py-2.5 px-3 text-center">Profitability</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {Object.entries(activePair.sessions).map(([sName, sData]) => {
                            const wr = sData.total > 0 ? (sData.wins / sData.total) * 100 : 0;
                            const isPos = sData.pnl >= 0;

                            return (
                              <tr key={sName} className="hover:bg-zinc-50/80 transition-all">
                                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                                  {sName}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-zinc-600">
                                  {sData.total}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold">
                                  <span className={wr >= 50 ? "text-emerald-600" : "text-rose-600"}>
                                    {wr.toFixed(0)}%
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                  isPos ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                  {formatMoney(sData.pnl)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isPos ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                  }`}>
                                    {isPos ? "Profitable" : "Loss"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Timing & Hold Duration Pathology (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Activity size={13} /> Trade Duration & Day Edge
                    </h5>

                    {/* Hold Time Pathology Box */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-700">Hold Time Comparison:</span>
                        <span className="text-[11px] font-mono text-zinc-500">Winners vs Losers</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded bg-white border border-zinc-200">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Winning Trades</div>
                          <div className="text-base font-bold font-mono text-zinc-900 mt-1">{holdTimeAnalysis.avgWinnerHold}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">Average in market</div>
                        </div>

                        <div className="p-2.5 rounded bg-white border border-zinc-200">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-rose-600">Losing Trades</div>
                          <div className="text-base font-bold font-mono text-zinc-900 mt-1">{holdTimeAnalysis.avgLoserHold}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">Average in market</div>
                        </div>
                      </div>

                      {holdTimeAnalysis.loserHeldLonger && (
                        <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                          <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                          <span>
                            <strong>Behavioral Alert:</strong> Losers on {activePair.pair} are held {holdTimeAnalysis.ratio}x longer than winners. Cut losers quicker!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Day of Week Edge Pills */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                      <div className="text-xs font-semibold text-zinc-700 mb-2">Weekday Performance ({activePair.pair})</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(activePair.weekdays).map(([day, d]) => (
                          <div key={day} className="px-2.5 py-1.5 rounded bg-white border border-zinc-200 text-xs font-mono">
                            <span className="font-bold text-zinc-700">{day.slice(0, 3)}: </span>
                            <span className={`font-bold ${d.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {formatMoney(d.pnl)}
                            </span>
                            <span className="text-zinc-400 text-[10px] ml-1">({d.total})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* --- SUB-TAB 2: STRATEGY MATRIX --- */}
            {inspectorSubTab === 'strategies' && (
              <div className="pt-4 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Target size={13} /> Strategy & Setup Breakdown on {activePair.pair}
                  </h5>
                  <span className="text-xs text-zinc-500 font-medium">
                    Top Setup: <strong className="text-zinc-900 font-bold">{activePair.bestStrategy}</strong>
                  </span>
                </div>

                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Setup Name</th>
                        <th className="py-2.5 px-3 text-center">Trades</th>
                        <th className="py-2.5 px-3 text-center">Win Rate</th>
                        <th className="py-2.5 px-3 text-right">Net Return</th>
                        <th className="py-2.5 px-3 text-center">Edge Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {Object.entries(activePair.strategies).map(([stratName, stratData]) => {
                        const wr = stratData.total > 0 ? (stratData.wins / stratData.total) * 100 : 0;
                        const isPos = stratData.pnl >= 0;
                        const isTop = stratName === activePair.bestStrategy;

                        return (
                          <tr key={stratName} className={`transition-all ${isTop ? 'bg-zinc-50/60 font-semibold' : 'hover:bg-zinc-50/80'}`}>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-900">{stratName}</span>
                                {isTop && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase flex items-center gap-0.5">
                                    <Award size={10} /> Best
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-zinc-600">
                              {stratData.total}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex flex-col items-center gap-0.5 font-mono font-bold">
                                <span className={wr >= 50 ? "text-emerald-600" : "text-rose-600"}>
                                  {wr.toFixed(0)}%
                                </span>
                                <span className="text-[10px] text-zinc-400 font-normal">
                                  {stratData.wins}W / {stratData.total - stratData.wins}L
                                </span>
                              </div>
                            </td>
                            <td className={`py-3 px-3 text-right font-mono font-bold ${
                              isPos ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {formatMoney(stratData.pnl)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase font-mono ${
                                wr >= 65 && isPos
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isPos
                                  ? "bg-zinc-100 text-zinc-700"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {wr >= 65 && isPos ? "High Edge" : isPos ? "Viable" : "Negative Edge"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- SUB-TAB 3: RISK & PSYCHOLOGY --- */}
            {inspectorSubTab === 'psychology' && (
              <div className="pt-4 space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Emotion correlation on this pair (6 Cols) */}
                  <div className="lg:col-span-6 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Brain size={13} /> Emotional State vs Performance ({activePair.pair})
                    </h5>

                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Emotion</th>
                            <th className="py-2.5 px-3 text-center">Trades</th>
                            <th className="py-2.5 px-3 text-center">Win Rate</th>
                            <th className="py-2.5 px-3 text-right">Net P&L</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {emotionsBreakdown.map((em) => {
                            const wr = em.total > 0 ? (em.wins / em.total) * 100 : 0;
                            const isPos = em.pnl >= 0;

                            return (
                              <tr key={em.emotion} className="hover:bg-zinc-50/80 transition-all">
                                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                                  {em.emotion}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-zinc-600">
                                  {em.total}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold">
                                  <span className={wr >= 50 ? "text-emerald-600" : "text-rose-600"}>
                                    {wr.toFixed(0)}%
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                  isPos ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                  {formatMoney(em.pnl)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Best & Worst Execution Spotlight Cards (6 Cols) */}
                  <div className="lg:col-span-6 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Award size={13} /> Trade Extremes Spotlight
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Best Trade Spotlight */}
                      <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Best Execution
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-600">
                            {tradeExtremes.best ? formatMoney(tradeExtremes.best.pnl) : '$0.00'}
                          </span>
                        </div>
                        {tradeExtremes.best ? (
                          <div className="space-y-1 text-xs text-zinc-600">
                            <div><strong className="text-zinc-800">Date:</strong> {tradeExtremes.best.date ? new Date(tradeExtremes.best.date).toLocaleDateString() : 'N/A'}</div>
                            <div><strong className="text-zinc-800">Setup:</strong> {tradeExtremes.best.setup || 'Unspecified'}</div>
                            <div><strong className="text-zinc-800">Session:</strong> {tradeExtremes.best.session || 'N/A'}</div>
                            {tradeExtremes.best.rr_ratio && (
                              <div><strong className="text-zinc-800">R:R:</strong> {tradeExtremes.best.rr_ratio}R</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 italic">No winning trades recorded.</div>
                        )}
                      </div>

                      {/* Worst Trade Spotlight */}
                      <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                            <XCircle size={12} /> Worst Execution
                          </span>
                          <span className="font-mono text-xs font-bold text-rose-600">
                            {tradeExtremes.worst ? formatMoney(tradeExtremes.worst.pnl) : '$0.00'}
                          </span>
                        </div>
                        {tradeExtremes.worst ? (
                          <div className="space-y-1 text-xs text-zinc-600">
                            <div><strong className="text-zinc-800">Date:</strong> {tradeExtremes.worst.date ? new Date(tradeExtremes.worst.date).toLocaleDateString() : 'N/A'}</div>
                            <div><strong className="text-zinc-800">Setup:</strong> {tradeExtremes.worst.setup || 'Unspecified'}</div>
                            <div><strong className="text-zinc-800">Session:</strong> {tradeExtremes.worst.session || 'N/A'}</div>
                            {tradeExtremes.worst.emotion && (
                              <div><strong className="text-zinc-800">Emotion:</strong> {tradeExtremes.worst.emotion}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 italic">No losing trades recorded.</div>
                        )}
                      </div>

                    </div>

                    {/* Streak Info Banner */}
                    <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                      <span>Max Historical Win Streak: <strong className="text-emerald-600 font-mono font-bold">{streakMetrics.maxWinStreak} trades</strong></span>
                      <span>Max Historical Drawdown Streak: <strong className="text-rose-600 font-mono font-bold">{streakMetrics.maxLossStreak} trades</strong></span>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* --- SUB-TAB 4: TRADE LOG FOR THIS ASSET --- */}
            {inspectorSubTab === 'trades' && (
              <div className="pt-4 space-y-3 animate-in fade-in duration-150">
                
                {/* Filter Pills for Active Pair Trades */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                  <div className="flex bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                    {(['ALL', 'WIN', 'LOSS', 'BE', 'LONG', 'SHORT'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTradeFilter(filter)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                          tradeFilter === filter
                            ? 'bg-zinc-950 text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-zinc-400 font-medium font-mono">
                    Showing {pairFilteredTrades.length} of {activePair.total} executions
                  </span>
                </div>

                {/* Table of Executions */}
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-center">Type</th>
                        <th className="py-2.5 px-3">Setup</th>
                        <th className="py-2.5 px-3">Session</th>
                        <th className="py-2.5 px-3 text-right">Entry / Exit</th>
                        <th className="py-2.5 px-3 text-center">R:R</th>
                        <th className="py-2.5 px-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {pairFilteredTrades.map((t) => {
                        const isWin = !t.is_breakeven && t.pnl > 0;
                        const isLoss = !t.is_breakeven && t.pnl < 0;

                        return (
                          <tr key={t.id} className="hover:bg-zinc-50/80 transition-all">
                            <td className="py-2.5 px-3 font-mono text-zinc-600">
                              {t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                t.direction === 'LONG'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {t.direction}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-zinc-900">
                              {t.setup || "Unspecified"}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-600">
                              {t.session || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                              {t.entry_price ? t.entry_price.toFixed(4) : "-"}
                              {t.exit_price ? ` → ${t.exit_price.toFixed(4)}` : ""}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-zinc-600">
                              {t.rr_ratio ? `${t.rr_ratio}R` : "-"}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                              t.is_breakeven ? "text-blue-600" : isWin ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {t.is_breakeven ? "$0.00 (BE)" : formatMoney(t.pnl)}
                            </td>
                          </tr>
                        );
                      })}

                      {pairFilteredTrades.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-zinc-400 italic">
                            No trades match filter "{tradeFilter}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* --- TAB 2: COMPREHENSIVE CROSS-ASSET COMPARISON MATRIX --- */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs animate-in fade-in duration-200 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                Cross-Asset Comparison Matrix
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Benchmark performance, edge consistency, and volume distribution across all traded pairs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Sort By:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="text-xs font-semibold rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="pnl">Net P&L ($)</option>
                <option value="total">Executions (Volume)</option>
                <option value="winRate">Win Rate (%)</option>
                <option value="profitFactor">Profit Factor</option>
              </select>

              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="px-2 py-1 text-xs font-semibold rounded border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 cursor-pointer font-mono"
              >
                {sortAsc ? "ASC" : "DESC"}
              </button>
            </div>
          </div>

          <div className="border border-zinc-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Symbol</th>
                  <th className="py-3 px-3 text-center">Executions</th>
                  <th className="py-3 px-3 text-center">Win Rate</th>
                  <th className="py-3 px-3 text-center">W / L / BE</th>
                  <th className="py-3 px-3 text-right">Net P&L</th>
                  <th className="py-3 px-3 text-center">Profit Factor</th>
                  <th className="py-3 px-3 text-center">Expectancy</th>
                  <th className="py-3 px-3 text-center">Top Session</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPairs.map((p) => {
                  const isSelected = activePair?.pair === p.pair;
                  const isPos = p.pnl >= 0;

                  return (
                    <tr
                      key={p.pair}
                      onClick={() => {
                        setSelectedPair(p.pair);
                        setActiveTab('deep');
                      }}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-zinc-50 font-bold border-l-2 border-zinc-950' 
                          : 'hover:bg-zinc-50/70'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-xs font-mono tracking-tight">
                            {p.pair}
                          </span>
                          {p.assetType && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-100 text-zinc-600 uppercase">
                              {p.assetType}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-medium text-zinc-600">
                        <span>{p.total}</span>
                        <span className="text-[10px] text-zinc-400 ml-1">({p.volumeShare.toFixed(0)}%)</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-mono font-bold ${p.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {p.winRate.toFixed(0)}%
                          </span>
                          <div className="w-12 h-1 bg-zinc-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${p.winRate >= 50 ? 'bg-emerald-600' : 'bg-rose-500'}`} 
                              style={{ width: `${Math.min(100, Math.max(0, p.winRate))}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center text-[11px] font-mono text-zinc-500">
                        <span className="text-zinc-800 font-semibold">{p.wins}W</span> / <span className="text-rose-600 font-semibold">{p.losses}L</span>
                        {p.be > 0 && <span className="text-blue-600 font-semibold ml-1">{p.be}BE</span>}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        isPos ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {formatMoney(p.pnl)}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold text-zinc-700">
                        {p.profitFactor === Infinity ? (
                          <span className="text-emerald-600 font-bold">MAX</span>
                        ) : p.profitFactor > 0 ? (
                          <span className={p.profitFactor >= 1.5 ? 'text-emerald-600 font-bold' : p.profitFactor >= 1 ? 'text-zinc-800' : 'text-rose-600'}>
                            {p.profitFactor.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>

                      <td className={`py-3 px-3 text-center font-mono font-semibold ${
                        p.expectancy >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {formatMoney(p.expectancy)}
                      </td>

                      <td className="py-3 px-3 text-center font-medium text-zinc-600">
                        {p.bestSession}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-zinc-950 text-white hover:bg-zinc-800 transition-all flex items-center gap-1 mx-auto"
                        >
                          <span>Studio</span>
                          <ArrowRight size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </section>
  );
}
