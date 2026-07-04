// src/app/(main)/analytics/AnalyticsClient.tsx
"use client";

import { useState, useRef } from "react";
import { Trade } from "@/types/database";
import { Wallet, BarChart3, Activity, Target, TrendingUp, Zap, Clock, Award, Layers, DollarSign, Calendar, Cpu } from "lucide-react";

export default function AnalyticsClient({ trades }: { trades: Trade[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. CORE STATISTIEKEN BEREKENEN ---
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  const totalNetPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFees = trades.reduce((sum, t) => sum + (t.commission || 0) + (t.swap || 0), 0);
  
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  
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

  const longs = trades.filter(t => t.direction === 'LONG');
  const shorts = trades.filter(t => t.direction === 'SHORT');
  const longWinRate = longs.length > 0 ? (longs.filter(t => t.pnl > 0).length / longs.length) * 100 : 0;
  const shortWinRate = shorts.length > 0 ? (shorts.filter(t => t.pnl > 0).length / shorts.length) * 100 : 0;

  const today = new Date().toDateString();
  const todaysTrades = trades.filter(t => new Date(t.date).toDateString() === today);
  const todaysPnl = todaysTrades.reduce((sum, t) => sum + t.pnl, 0);

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            <span className="text-slate-800">{wins.length}W</span> <span className="text-slate-300">/</span> <span className="text-red-650">{losses.length}L</span>
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

          <div className="bg-zinc-950 border border-zinc-900 rounded-md p-6 shadow-sm text-center relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-zinc-900/10 blur-[50px] rounded-full pointer-events-none transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-zinc-900 rounded-full mb-3 border border-zinc-800">
                <Cpu size={20} className="text-zinc-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">PipVault AI</h3>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                AI Analysis coming soon to help you optimize based on this data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}