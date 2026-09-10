// src/app/(main)/analytics/AnalyticsClient.tsx
"use client";

import { useState, useRef } from "react";
import { Trade } from "@/types/database";
import { Wallet, BarChart3, Activity, Target, TrendingUp, Zap, Clock, Award, Layers, DollarSign, Calendar, Cpu, AlertTriangle, Brain } from "lucide-react";
import CustomSelect from "@/components/journal/CustomSelect";

export default function AnalyticsClient({ 
  trades,
  userProfile 
}: { 
  trades: Trade[]; 
  userProfile?: {
    strategies: string[];
    sessions: string[];
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // --- 1. CORE STATISTIEKEN BEREKENEN ---
  const totalTrades = trades.length;
  const breakevens = trades.filter((t) => t.is_breakeven);
  const nonBreakevens = trades.filter((t) => !t.is_breakeven);
  const wins = nonBreakevens.filter((t) => t.pnl > 0);
  const losses = nonBreakevens.filter((t) => t.pnl <= 0);

  const totalNetPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFees = trades.reduce((sum, t) => sum + (t.commission || 0) + (t.swap || 0), 0);
  
  const winRate = nonBreakevens.length > 0 ? (wins.length / nonBreakevens.length) * 100 : 0;
  
  const totalWinPnl = wins.reduce((sum, t) => sum + t.pnl, 0);
  const totalLossPnl = losses.reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = wins.length > 0 ? totalWinPnl / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossPnl / losses.length : 0;
  
  const largestWin = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const largestLoss = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;
  
  const expectancy = totalTrades > 0 ? totalNetPnl / totalTrades : 0;

  const pairStats = trades.reduce((acc, t) => {
    acc[t.pair] = (acc[t.pair] || 0) + t.pnl;
    return acc;
  }, {} as Record<string, number>);
  const bestPair = Object.keys(pairStats).length > 0 ? Object.keys(pairStats).reduce((a, b) => pairStats[a] > pairStats[b] ? a : b) : "N/A";

  const longs = nonBreakevens.filter(t => t.direction === 'LONG');
  const shorts = nonBreakevens.filter(t => t.direction === 'SHORT');
  const longWinRate = longs.length > 0 ? (longs.filter(t => t.pnl > 0).length / longs.length) * 100 : 0;
  const shortWinRate = shorts.length > 0 ? (shorts.filter(t => t.pnl > 0).length / shorts.length) * 100 : 0;

  const today = new Date().toDateString();
  const todaysTrades = trades.filter(t => new Date(t.date).toDateString() === today);
  const todaysPnl = todaysTrades.reduce((sum, t) => sum + t.pnl, 0);

  // --- 1B. PERIOD & STRATEGY ANALYSIS ---
  const sessionsList = userProfile?.sessions && userProfile.sessions.length > 0 
    ? userProfile.sessions 
    : ["London", "New York", "Tokyo", "Sydney"];
  const weekdaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Helper to extract weekday name from ISO date string
  const getWeekdayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Best strategy per session
  const bestStrategyPerSession = sessionsList.map(session => {
    const sessionTrades = trades.filter(t => t.session && t.session.toLowerCase() === session.toLowerCase());
    
    // Group by strategy
    const strategyGroup: Record<string, { pnl: number, wins: number, total: number }> = {};
    sessionTrades.forEach(t => {
      const setup = t.setup || "Unknown";
      if (!strategyGroup[setup]) {
        strategyGroup[setup] = { pnl: 0, wins: 0, total: 0 };
      }
      strategyGroup[setup].pnl += t.pnl || 0;
      strategyGroup[setup].total += 1;
      if (!t.is_breakeven && t.pnl > 0) {
        strategyGroup[setup].wins += 1;
      }
    });

    // Find best strategy by P&L
    let bestStrategy = "No trades";
    let maxPnl = -Infinity;
    let stats = { pnl: 0, winRate: 0, total: 0 };

    Object.entries(strategyGroup).forEach(([strategy, data]) => {
      if (data.pnl > maxPnl) {
        maxPnl = data.pnl;
        bestStrategy = strategy;
        const nonBe = data.total - sessionTrades.filter(t => t.setup === strategy && t.is_breakeven).length;
        const wr = nonBe > 0 ? (data.wins / nonBe) * 100 : 0;
        stats = { pnl: data.pnl, winRate: wr, total: data.total };
      }
    });

    return { session, bestStrategy, ...stats };
  });

  // Best strategy per weekday
  const bestStrategyPerWeekday = weekdaysList.map(day => {
    const dayTrades = trades.filter(t => t.date && getWeekdayName(t.date) === day);
    
    // Group by strategy
    const strategyGroup: Record<string, { pnl: number, wins: number, total: number }> = {};
    dayTrades.forEach(t => {
      const setup = t.setup || "Unknown";
      if (!strategyGroup[setup]) {
        strategyGroup[setup] = { pnl: 0, wins: 0, total: 0 };
      }
      strategyGroup[setup].pnl += t.pnl || 0;
      strategyGroup[setup].total += 1;
      if (!t.is_breakeven && t.pnl > 0) {
        strategyGroup[setup].wins += 1;
      }
    });

    // Find best strategy by P&L
    let bestStrategy = "No trades";
    let maxPnl = -Infinity;
    let stats = { pnl: 0, winRate: 0, total: 0 };

    Object.entries(strategyGroup).forEach(([strategy, data]) => {
      if (data.pnl > maxPnl) {
        maxPnl = data.pnl;
        bestStrategy = strategy;
        const nonBe = data.total - dayTrades.filter(t => t.setup === strategy && t.is_breakeven).length;
        const wr = nonBe > 0 ? (data.wins / nonBe) * 100 : 0;
        stats = { pnl: data.pnl, winRate: wr, total: data.total };
      }
    });

    return { day, bestStrategy, ...stats };
  });

  // --- 1C. DEEPER EMOTION PERFORMANCE & INSIGHTS ---
  const emotionsList = ["Neutral", "Confident", "Anxious", "FOMO", "Revenge Trading"];
  
  const emotionStats = emotionsList.map(emotion => {
    const emotionTrades = trades.filter(t => t.emotion && t.emotion.toLowerCase() === emotion.toLowerCase());
    const total = emotionTrades.length;
    const nonBeTrades = emotionTrades.filter(t => !t.is_breakeven);
    const wins = nonBeTrades.filter(t => t.pnl > 0).length;
    const pnl = emotionTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = nonBeTrades.length > 0 ? (wins / nonBeTrades.length) * 100 : 0;
    const avgPnl = total > 0 ? pnl / total : 0;

    return {
      emotion,
      total,
      pnl,
      winRate,
      avgPnl
    };
  });

  // Calculate dynamic insights based on emotion statistics
  const tradedEmotions = emotionStats.filter(e => e.total > 0);
  const worstEmotion = tradedEmotions.length > 0
    ? tradedEmotions.reduce((worst, current) => current.pnl < worst.pnl ? current : worst, tradedEmotions[0])
    : null;

  const bestEmotion = tradedEmotions.length > 0
    ? tradedEmotions.reduce((best, current) => current.pnl > best.pnl ? current : best, tradedEmotions[0])
    : null;

  // --- 1D. DETAILED STRATEGY PERFORMANCE & TRENDS ---
  const strategiesList = userProfile?.strategies && userProfile.strategies.length > 0
    ? userProfile.strategies
    : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"];

  const strategyStats = strategiesList.map(strategy => {
    const stratTrades = trades.filter(t => t.setup && t.setup.toLowerCase() === strategy.toLowerCase());
    const total = stratTrades.length;
    const nonBeTrades = stratTrades.filter(t => !t.is_breakeven);
    const wins = nonBeTrades.filter(t => t.pnl > 0).length;
    const pnl = stratTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = nonBeTrades.length > 0 ? (wins / nonBeTrades.length) * 100 : 0;
    const avgPnl = total > 0 ? pnl / total : 0;

    // Average Risk-Reward
    const rrTrades = stratTrades.filter(t => t.rr_ratio !== null && t.rr_ratio > 0);
    const avgRR = rrTrades.length > 0
      ? rrTrades.reduce((sum, t) => sum + (t.rr_ratio || 0), 0) / rrTrades.length
      : 0;

    // Optimal conditions (best session + best day)
    let bestSession = "N/A";
    let maxSessionPnl = -Infinity;
    const sessionPnls: Record<string, number> = {};
    stratTrades.forEach(t => {
      if (t.session) {
        sessionPnls[t.session] = (sessionPnls[t.session] || 0) + (t.pnl || 0);
      }
    });
    Object.entries(sessionPnls).forEach(([sess, pnlVal]) => {
      if (pnlVal > maxSessionPnl) {
        maxSessionPnl = pnlVal;
        bestSession = sess;
      }
    });

    let bestDay = "N/A";
    let maxDayPnl = -Infinity;
    const dayPnls: Record<string, number> = {};
    stratTrades.forEach(t => {
      if (t.date) {
        const dayName = getWeekdayName(t.date);
        dayPnls[dayName] = (dayPnls[dayName] || 0) + (t.pnl || 0);
      }
    });
    Object.entries(dayPnls).forEach(([dayName, pnlVal]) => {
      if (pnlVal > maxDayPnl) {
        maxDayPnl = pnlVal;
        bestDay = dayName;
      }
    });

    let optimalConditions = "N/A";
    if (bestSession !== "N/A" && bestDay !== "N/A") {
      optimalConditions = `${bestSession} on ${bestDay}s`;
    } else if (bestSession !== "N/A") {
      optimalConditions = bestSession;
    } else if (bestDay !== "N/A") {
      optimalConditions = `${bestDay}s`;
    }

    return {
      strategy,
      total,
      pnl,
      winRate,
      avgPnl,
      avgRR,
      optimalConditions
    };
  });

  // --- 1E. STRATEGY PERFORMANCE OVER TIME (MONTHLY TRENDS) ---
  const getMonthYearString = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const monthsWithTrades = Array.from(
    new Set(
      trades
        .map(t => t.date ? getMonthYearString(t.date) : null)
        .filter((m): m is string => !!m)
    )
  ).slice(-6); // Limit to last 6 months

  const monthlyStrategyStats = monthsWithTrades.map(month => {
    const monthTrades = trades.filter(t => t.date && getMonthYearString(t.date) === month);
    
    const strategyPnls = strategiesList.map(strat => {
      const stratTrades = monthTrades.filter(t => t.setup && t.setup.toLowerCase() === strat.toLowerCase());
      const pnl = stratTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const total = stratTrades.length;
      return {
        strategy: strat,
        pnl,
        total
      };
    }).filter(s => s.total > 0);

    return {
      month,
      strategies: strategyPnls
    };
  });

  const activeMonth = selectedMonth || (monthsWithTrades.length > 0 ? monthsWithTrades[monthsWithTrades.length - 1] : "");
  const activeMonthData = monthlyStrategyStats.find(m => m.month === activeMonth);

  // --- 2. DYNAMISCHE EQUITY CURVE GENEREREN ---
  const startingBalance = 10000;
  let runningBalance = startingBalance;
  
  const equityData = [
    { date: "Start", balance: startingBalance, pnl: 0 }
  ];

  trades.forEach((trade) => {
    runningBalance += (trade.pnl || 0);
    equityData.push({
      date: trade.date ? new Date(trade.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '',
      balance: runningBalance,
      pnl: trade.pnl
    });
  });

  // --- 3. TRACK DE INDEX  ---

  const balances = equityData.map(d => d.balance);
  const maxBalance = balances.length > 0 ? Math.max(...balances) * 1.01 : startingBalance * 1.05;
  const minBalance = balances.length > 0 ? Math.min(...balances) * 0.99 : startingBalance * 0.95;
  const balanceRange = maxBalance - minBalance;

  const dataLength = Math.max(1, equityData.length - 1);
  const getSvgX = (index: number) => (index / dataLength) * 1000;
  const getSvgY = (balance: number) => {
    if (balanceRange === 0) return 150;
    return 250 - ((balance - minBalance) / balanceRange) * 200;
  };

  let linePath = "";
  let areaPath = "";

  if (equityData.length > 1) {
    equityData.forEach((point, i) => {
      const x = getSvgX(i);
      const y = getSvgY(point.balance);
      if (i === 0) {
        linePath += `M ${x},${y}`;
        areaPath += `M ${x},300 L ${x},${y}`;
      } else {
        linePath += ` L ${x},${y}`;
        areaPath += ` L ${x},${y}`;
      }
      if (i === equityData.length - 1) {
        areaPath += ` L ${x},300 Z`; 
      }
    });
  }

  // Exacte X-positie berekenen over het vangnet
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percentage * dataLength);
    
    setHoveredIndex(newIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Haal het actieve datapunt veilig op via de opgeslagen index
  const hoveredPoint = hoveredIndex !== null && hoveredIndex >= 0 ? equityData[hoveredIndex] : null;

  // Filter trades voor de actieve tooltip
  const hoveredTrades = hoveredPoint && hoveredPoint.date !== "Start" 
    ? trades.filter(t => {
        const tDate = t.date ? new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '';
        return tDate === hoveredPoint.date;
      })
    : [];

  const Card = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm transition-all hover:border-slate-350">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
        {Icon && <Icon size={14} className="text-slate-400" />}
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Analytics Deep Dive
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Advanced performance metrics and statistical breakdown.
        </p>
      </div>

      {/* --- GRID ROW 1 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Net P&L" icon={Wallet}>
          <div className={`text-3xl font-bold tracking-tight ${totalNetPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <Activity size={12} className="text-emerald-600" /> Fees: ${totalFees.toFixed(2)}
          </div>
        </Card>
        <Card title="Total Trades" icon={BarChart3}>
          <div className="text-3xl font-bold text-slate-900">{totalTrades}</div>
          <div className="mt-2 text-xs font-medium text-slate-500">Avg/Day: {(totalTrades / 30).toFixed(1)}</div>
        </Card>
        <Card title="Win Rate" icon={Activity}>
          <div className="text-3xl font-bold text-emerald-600">{winRate.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-200/50">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${winRate}%` }} />
          </div>
        </Card>
        <Card title="Wins vs Losses" icon={Target}>
          <div className="text-3xl font-bold text-slate-900">
            <span className="text-slate-800">{wins.length}W</span> <span className="text-slate-350">/</span> <span className="text-red-650">{losses.length}L</span>
            {breakevens.length > 0 && <span className="text-xs font-semibold text-blue-650 ml-1.5">{breakevens.length}BE</span>}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">{(wins.length / (losses.length || 1)).toFixed(2)} ratio</div>
        </Card>
      </div>

      {/* --- GRID ROW 2 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Avg Win / Loss" icon={TrendingUp}>
          <div className="text-2xl font-bold">
            <span className="text-emerald-650">${avgWin.toFixed(2)}</span> <span className="text-slate-300">/</span> <span className="text-red-650">-${Math.abs(avgLoss).toFixed(2)}</span>
          </div>
          <div className="flex h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-200/50">
            <div className="h-full bg-emerald-600" style={{ width: '60%' }} />
            <div className="h-full bg-red-600" style={{ width: '40%' }} />
          </div>
        </Card>
        <Card title="Best Streaks" icon={Zap}>
          <div className="text-2xl font-bold text-slate-800">
            {Math.max(wins.length, 5)}W <span className="text-slate-350">/</span> 1L
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">Consecutive results</div>
        </Card>
        <Card title="Largest Win / Loss" icon={Layers}>
          <div className="text-2xl font-bold text-emerald-600">${largestWin.toFixed(0)}</div>
          <div className="mt-2 text-xs font-medium text-slate-500">Max Loss: -${Math.abs(largestLoss).toFixed(0)}</div>
        </Card>
        <Card title="Expectancy" icon={Target}>
          <div className={`text-2xl font-bold ${expectancy >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
            {expectancy >= 0 ? '+' : ''}${expectancy.toFixed(2)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">Per trade</div>
        </Card>
      </div>

      {/* --- GRID ROW 3 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Avg Hold Time" icon={Clock}>
          <div className="text-2xl font-bold text-slate-800">1hrs 31m</div>
          <div className="mt-2 text-xs font-medium text-slate-500">Entry to Exit</div>
        </Card>
        <Card title="Best Performance" icon={Award}>
          <div className="text-2xl font-bold text-slate-850">{bestPair}</div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            +{pairStats[bestPair] ? pairStats[bestPair].toFixed(2) : "0.00"}
          </div>
        </Card>
        <Card title="Long vs Short" icon={Layers}>
          <div className="text-2xl font-bold text-slate-800">
            {longWinRate.toFixed(0)}% <span className="text-slate-300">/</span> {shortWinRate.toFixed(0)}%
          </div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">L: {longs.length}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">S: {shorts.length}</span>
          </div>
        </Card>
        <Card title="Total Commissions" icon={DollarSign}>
          <div className="text-2xl font-bold text-red-700">${totalFees.toFixed(2)}</div>
          <div className="mt-2 text-xs font-medium text-slate-500">Fees + Swap</div>
        </Card>
      </div>

      {/* --- CHART SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col relative select-none">
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Account Balance
              </h3>
              <div className="text-3xl font-bold text-slate-900">
                ${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className={`text-sm font-bold ml-2 ${totalNetPnl >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
                  {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
                </span>
              </div>
            </div>
            <Wallet size={16} className="text-slate-450" />
          </div>
          
          <div ref={containerRef} className="flex-1 relative min-h-[250px] w-full mt-auto rounded-md flex items-end">
             
             {/* Achtergrond Matrix */}
             <div className="absolute inset-0 flex flex-col justify-between px-2 py-4 pointer-events-none opacity-60">
               <div className="w-full border-t border-slate-200/60 border-dashed h-0" />
               <div className="w-full border-t border-slate-200/60 border-dashed h-0" />
               <div className="w-full border-t border-slate-200/60 border-dashed h-0" />
               <div className="w-full border-t border-slate-200/60 border-dashed h-0" />
               <div className="w-full border-t border-slate-200/60 border-dashed h-0" />
             </div>

             {equityData.length > 1 && (
               <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#areaGradient)" />
                  <path d={linePath} fill="none" stroke="#0f172a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
               </svg>
             )}

             {/* HET ONZICHTBARE VANGNET */}
             <div 
               className="absolute inset-0 z-40 cursor-crosshair"
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
             />

             {/* INTERACTIEVE HOVER TOOLTIP */}
             {hoveredIndex !== null && hoveredPoint && (
                <div className="absolute inset-0 z-30 pointer-events-none">
                  <div 
                    className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-400/50 transition-all duration-75"
                    style={{ left: `${(hoveredIndex / dataLength) * 100}%` }}
                  />
                  
                  <div 
                    className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 border-2 border-white shadow-sm transition-all duration-75"
                    style={{ 
                      left: `${(hoveredIndex / dataLength) * 100}%`,
                      top: `${100 - (((hoveredPoint.balance - minBalance) / (balanceRange || 1)) * 66.6 + 16.6)}%`
                    }}
                  />

                  <div 
                    className="absolute top-[10%] bg-zinc-950 border border-zinc-900 p-3.5 rounded-md shadow-lg min-w-[220px] transition-transform duration-75"
                    style={{ 
                      left: `${(hoveredIndex / dataLength) * 100}%`,
                      transform: (hoveredIndex / dataLength) > 0.65 ? 'translateX(calc(-100% - 16px))' : 'translateX(16px)'
                    }}
                  >
                    <div className="flex items-center gap-2 text-slate-400 mb-3 border-b border-zinc-800 pb-1.5">
                      <Calendar size={13} />
                      <span className="text-xs font-semibold text-slate-350">{hoveredPoint.date}</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Equity</div>
                      <div className="text-xl font-bold text-white">
                        ${hoveredPoint.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {hoveredTrades.length > 0 && (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                        {hoveredTrades.map(t => (
                          <div key={t.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="text-slate-200 font-bold tracking-tight">{t.pair}</span>
                              <span className="text-[9px] text-slate-400 font-semibold uppercase">{t.direction}</span>
                            </div>
                            <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {t.pnl >= 0 ? '+' : '-'}${Math.abs(t.pnl).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-medium px-2 relative z-10 pointer-events-none">
            {equityData.length <= 6 ? (
              equityData.map((d, i) => <span key={i}>{d.date}</span>)
            ) : (
              <>
                <span>{equityData[0].date}</span>
                <span>{equityData[Math.floor(equityData.length * 0.25)].date}</span>
                <span>{equityData[Math.floor(equityData.length * 0.5)].date}</span>
                <span>{equityData[Math.floor(equityData.length * 0.75)].date}</span>
                <span>{equityData[equityData.length - 1].date}</span>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-slate-400" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Session</h3>
            </div>
            <div className={`text-3xl font-bold tracking-tight ${todaysPnl >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
              ${todaysPnl.toFixed(2)}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1 mb-6">
              {todaysTrades.length} trades executed today
            </div>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Streak</span>
                <span className="text-slate-800 font-bold">5 Wins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Drawdown</span>
                <span className="text-red-650 font-bold">-${Math.abs(largestLoss).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit Factor</span>
                <span className="text-slate-800 font-bold">
                  {Math.abs(totalLossPnl) > 0 ? (totalWinPnl / Math.abs(totalLossPnl)).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- ADVANCED ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Period & Strategy Analysis */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm transition-all hover:border-slate-350 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Period & Strategy Performance
            </h3>
            <Clock size={14} className="text-slate-400" />
          </div>

          <div className="space-y-6">
            {/* By Session */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                Best Strategy by Trading Session
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {bestStrategyPerSession.map(({ session, bestStrategy, pnl, winRate, total }) => {
                  const hasTrades = total > 0;
                  const isProfitable = pnl > 0;
                  
                  return (
                    <div key={session} className="flex flex-col py-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">{session}</span>
                        {hasTrades && (
                          <span className={`text-xs font-bold ${isProfitable ? "text-emerald-600" : pnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                            {isProfitable ? "+" : ""}${pnl.toFixed(0)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {hasTrades ? (
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-500 truncate max-w-[130px]" title={bestStrategy}>
                              {bestStrategy}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">
                              {winRate.toFixed(0)}% WR · {total}t
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">No trades</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Weekday */}
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Best Strategy by Day of the Week
              </h4>
              <div className="space-y-2.5">
                {bestStrategyPerWeekday.map(({ day, bestStrategy, pnl, winRate, total }) => {
                  const hasTrades = total > 0;
                  const isProfitable = pnl > 0;

                  return (
                    <div key={day} className="flex items-center justify-between text-xs py-0.5">
                      <span className="font-bold text-slate-700 w-24">{day}</span>
                      {hasTrades ? (
                        <>
                          <span className="font-semibold text-slate-500 flex-1 truncate px-2">{bestStrategy}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-bold">{winRate.toFixed(0)}% WR · {total}t</span>
                            <span className={`font-bold w-16 text-right ${isProfitable ? "text-emerald-600" : pnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                              {isProfitable ? "+" : ""}${pnl.toFixed(0)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic flex-1 px-2">No trades</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Performance Analysis */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm transition-all hover:border-slate-350 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Emotion Performance Analysis
              </h3>
              <Brain size={14} className="text-slate-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Emotion</th>
                    <th className="pb-3 text-center">Trades</th>
                    <th className="pb-3 text-center">Win Rate</th>
                    <th className="pb-3 text-right">Avg P&L</th>
                    <th className="pb-3 text-right">Total P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {emotionStats.map(({ emotion, total, pnl, winRate, avgPnl }) => {
                    const hasTrades = total > 0;
                    
                    return (
                      <tr key={emotion} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-2.5 font-bold text-slate-800">{emotion}</td>
                        <td className="py-2.5 text-center font-medium text-slate-500">{total}</td>
                        <td className="py-2.5 text-center">
                          {hasTrades ? (
                            <span className={winRate >= 50 ? "text-emerald-600" : "text-red-650"}>
                              {winRate.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className={`py-2.5 text-right ${avgPnl > 0 ? "text-emerald-600" : avgPnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                          {hasTrades ? `${avgPnl >= 0 ? "+" : ""}$${avgPnl.toFixed(0)}` : "-"}
                        </td>
                        <td className={`py-2.5 text-right font-bold ${pnl > 0 ? "text-emerald-600" : pnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                          {hasTrades ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Insights Callout */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            {worstEmotion && worstEmotion.avgPnl < 0 && (
              <div className="flex gap-3 border-l-2 border-red-500 pl-3.5 py-0.5">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-red-600 uppercase tracking-wider">
                    Behavioral Insight
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    Trading while feeling <strong>{worstEmotion.emotion.toLowerCase()}</strong> is costing you an average of{" "}
                    <span className="text-red-650 font-bold">-${Math.abs(worstEmotion.avgPnl).toFixed(0)}</span> per trade.
                  </p>
                </div>
              </div>
            )}

            {bestEmotion && bestEmotion.avgPnl > 0 && (
              <div className="flex gap-3 border-l-2 border-emerald-500 pl-3.5 py-0.5">
                <Brain size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                    Performance Tip
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    Your best mindset is <strong>{bestEmotion.emotion.toLowerCase()}</strong>, yielding an average of{" "}
                    <span className="text-emerald-600 font-bold">+${bestEmotion.avgPnl.toFixed(0)}</span> per trade.
                  </p>
                </div>
              </div>
            )}

            {tradedEmotions.length === 0 && (
              <div className="text-xs text-slate-400 text-center italic">
                Add more trades with emotion tags to generate behavioral insights.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- STRATEGY DEEP DIVE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Strategy Performance Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-5 shadow-sm transition-all hover:border-slate-350 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Strategy Performance Matrix
            </h3>
            <Award size={14} className="text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Strategy</th>
                  <th className="pb-3 text-center">Trades</th>
                  <th className="pb-3 text-center">Win Rate</th>
                  <th className="pb-3 text-center">Avg R:R</th>
                  <th className="pb-3 text-right">Avg P&L</th>
                  <th className="pb-3 text-right">Total P&L</th>
                  <th className="pb-3 pl-6">Optimal Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {strategyStats.map(({ strategy, total, pnl, winRate, avgPnl, avgRR, optimalConditions }) => {
                  const hasTrades = total > 0;
                  const isProfitable = pnl > 0;

                  return (
                    <tr key={strategy} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 font-bold text-slate-800">{strategy}</td>
                      <td className="py-3 text-center font-medium text-slate-500">{total}</td>
                      <td className="py-3 text-center">
                        {hasTrades ? (
                          <span className={winRate >= 50 ? "text-emerald-600" : "text-red-650"}>
                            {winRate.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-center font-medium text-slate-500">
                        {hasTrades && avgRR > 0 ? `1:${avgRR.toFixed(1)}` : "-"}
                      </td>
                      <td className={`py-3 text-right ${avgPnl > 0 ? "text-emerald-600" : avgPnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                        {hasTrades ? `${avgPnl >= 0 ? "+" : ""}$${avgPnl.toFixed(0)}` : "-"}
                      </td>
                      <td className={`py-3 text-right font-bold ${pnl > 0 ? "text-emerald-600" : pnl < 0 ? "text-red-650" : "text-slate-500"}`}>
                        {hasTrades ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}` : "-"}
                      </td>
                      <td className="py-3 pl-6 font-medium text-slate-500 text-[11px] truncate max-w-[180px]">
                        {optimalConditions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Strategy Breakdown */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-md p-5 shadow-sm transition-all hover:border-slate-350 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Monthly Strategy Trends
              </h3>
              {monthsWithTrades.length > 0 && (
                <div className="w-[125px] shrink-0 font-bold">
                  <CustomSelect
                    name="selectedMonth"
                    value={activeMonth}
                    options={monthsWithTrades}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {activeMonthData ? (
                <div className="space-y-2">
                  {activeMonthData.strategies.length > 0 ? (
                    activeMonthData.strategies.map(({ strategy, pnl, total }) => (
                      <div key={strategy} className="flex justify-between items-center text-xs py-0.5">
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]" title={strategy}>
                          {strategy}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] text-slate-400 font-bold">{total}t</span>
                          <span className={`font-bold min-w-[55px] text-right ${pnl >= 0 ? "text-emerald-600" : "text-red-650"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic text-center py-4">
                      No strategies traded in this month
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-8">
                  No monthly data available
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}