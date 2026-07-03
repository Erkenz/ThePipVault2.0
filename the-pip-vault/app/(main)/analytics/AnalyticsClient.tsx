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
    <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg transition-all hover:bg-card/60 hover:border-white/10">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
        {Icon && <Icon size={14} className="text-muted-foreground/50" />}
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
          Analytics Deep Dive
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Advanced performance metrics and statistical breakdown.
        </p>
      </div>

      {/* --- GRID ROW 1 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Net P&L" icon={Wallet}>
          <div className={`text-3xl font-black tracking-tight ${totalNetPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground">
            <Activity size={12} className="text-emerald-500" /> Fees: ${totalFees.toFixed(2)}
          </div>
        </Card>
        <Card title="Total Trades" icon={BarChart3}>
          <div className="text-3xl font-black text-blue-400">{totalTrades}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Avg/Day: {(totalTrades / 30).toFixed(1)}</div>
        </Card>
        <Card title="Win Rate" icon={Activity}>
          <div className="text-3xl font-black text-emerald-500">{winRate.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-background rounded-full mt-3 overflow-hidden border border-white/5">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${winRate}%` }} />
          </div>
        </Card>
        <Card title="Wins vs Losses" icon={Target}>
          <div className="text-3xl font-black text-foreground">
            <span className="text-blue-400">{wins.length}W</span> <span className="text-muted-foreground/30">/</span> <span className="text-rose-500">{losses.length}L</span>
          </div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">{(wins.length / (losses.length || 1)).toFixed(2)} ratio</div>
        </Card>
      </div>

      {/* --- GRID ROW 2 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Avg Win / Loss" icon={TrendingUp}>
          <div className="text-2xl font-black">
            <span className="text-emerald-500">${avgWin.toFixed(2)}</span> <span className="text-muted-foreground/30">/</span> <span className="text-rose-500">-${Math.abs(avgLoss).toFixed(2)}</span>
          </div>
          <div className="flex h-1.5 bg-background rounded-full mt-3 overflow-hidden border border-white/5">
            <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
            <div className="h-full bg-rose-500" style={{ width: '40%' }} />
          </div>
        </Card>
        <Card title="Best Streaks" icon={Zap}>
          <div className="text-2xl font-black text-fuchsia-500">
            {Math.max(wins.length, 5)}W <span className="text-muted-foreground/30">/</span> 1L
          </div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Consecutive results</div>
        </Card>
        <Card title="Largest Win / Loss" icon={Layers}>
          <div className="text-2xl font-black text-emerald-500">${largestWin.toFixed(0)}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Max Loss: -${Math.abs(largestLoss).toFixed(0)}</div>
        </Card>
        <Card title="Expectancy" icon={Target}>
          <div className="text-2xl font-black text-emerald-500">${expectancy.toFixed(2)}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Per trade</div>
        </Card>
      </div>

      {/* --- GRID ROW 3 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Avg Hold Time" icon={Clock}>
          <div className="text-2xl font-black text-orange-400">1hrs 31m</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Entry to Exit</div>
        </Card>
        <Card title="Best Performance" icon={Award}>
          <div className="text-2xl font-black text-fuchsia-400">{bestPair}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">
            +{pairStats[bestPair] ? pairStats[bestPair].toFixed(2) : "0.00"}
          </div>
        </Card>
        <Card title="Long vs Short" icon={Layers}>
          <div className="text-2xl font-black text-foreground">
            {longWinRate.toFixed(0)}% <span className="text-muted-foreground/30">/</span> {shortWinRate.toFixed(0)}%
          </div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">L: {longs.length}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">S: {shorts.length}</span>
          </div>
        </Card>
        <Card title="Total Commissions" icon={DollarSign}>
          <div className="text-2xl font-black text-rose-500">${totalFees.toFixed(2)}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">Fees + Swap</div>
        </Card>
      </div>

      {/* --- CHART SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <div className="lg:col-span-3 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col relative select-none">
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Account Balance
              </h3>
              <div className="text-3xl font-black text-foreground">
                ${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className={`text-sm font-bold ml-2 ${totalNetPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
                </span>
              </div>
            </div>
            <Wallet size={16} className="text-primary" />
          </div>
          
          <div ref={containerRef} className="flex-1 relative min-h-[250px] w-full mt-auto rounded-xl flex items-end">
             
             {/* Achtergrond Matrix */}
             <div className="absolute inset-0 flex flex-col justify-between px-2 py-4 pointer-events-none opacity-30">
               <div className="w-full border-t border-muted-foreground/30 border-dashed h-0" />
               <div className="w-full border-t border-muted-foreground/30 border-dashed h-0" />
               <div className="w-full border-t border-muted-foreground/30 border-dashed h-0" />
               <div className="w-full border-t border-muted-foreground/30 border-dashed h-0" />
               <div className="w-full border-t border-muted-foreground/30 border-dashed h-0" />
             </div>

             {equityData.length > 1 && (
               <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#areaGradient)" />
                  <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
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
                   className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/20 transition-all duration-75"
                   style={{ left: `${(hoveredIndex / dataLength) * 100}%` }}
                 />
                 
                 <div 
                   className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_#3b82f6] transition-all duration-75"
                   style={{ 
                     left: `${(hoveredIndex / dataLength) * 100}%`,
                     top: `${100 - (((hoveredPoint.balance - minBalance) / (balanceRange || 1)) * 66.6 + 16.6)}%`
                   }}
                 />

                 <div 
                   className="absolute top-[10%] bg-[#1A1D24] border border-white/5 p-4 rounded-xl shadow-2xl min-w-[220px] transition-transform duration-75"
                   style={{ 
                     left: `${(hoveredIndex / dataLength) * 100}%`,
                     transform: (hoveredIndex / dataLength) > 0.65 ? 'translateX(calc(-100% - 16px))' : 'translateX(16px)'
                   }}
                 >
                   <div className="flex items-center gap-2 text-muted-foreground mb-4">
                     <Calendar size={14} />
                     <span className="text-sm font-medium">{hoveredPoint.date}</span>
                   </div>
                   
                   <div className="mb-5">
                     <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Equity</div>
                     <div className="text-2xl font-black text-white">
                       ${hoveredPoint.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                   </div>

                   {hoveredTrades.length > 0 && (
                     <div className="space-y-3 pt-2 border-t border-white/5">
                       {hoveredTrades.map(t => (
                         <div key={t.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${t.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                             <span className="text-white font-bold text-sm tracking-wide">{t.pair}</span>
                             <span className="text-[10px] text-muted-foreground font-bold uppercase">{t.direction}</span>
                           </div>
                           <span className={`font-bold text-sm ${t.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {t.pnl >= 0 ? '+' : '$-'}{Math.abs(t.pnl).toFixed(2)}
                           </span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {hoveredIndex === null && equityData.length > 0 && (
               <div className="absolute w-3 h-3 right-0 -translate-y-1/2 translate-x-1/2 z-10 pointer-events-none" style={{ top: `${100 - (((equityData[equityData.length - 1].balance - minBalance) / (balanceRange || 1)) * 66.6 + 16.6)}%` }}>
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60"></div>
                  <div className="absolute inset-full rounded-full bg-white shadow-[0_0_10px_#8b5cf6]"></div>
               </div>
             )}
          </div>

          <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium px-2 relative z-10 pointer-events-none">
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
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-muted-foreground" />
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Session</h3>
            </div>
            <div className={`text-3xl font-black tracking-tight ${todaysPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${todaysPnl.toFixed(2)}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1 mb-6">
              {todaysTrades.length} trades executed today
            </div>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="text-foreground font-bold">5 Wins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drawdown</span>
                <span className="text-rose-500 font-bold">-${Math.abs(largestLoss).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit Factor</span>
                <span className="text-foreground font-bold">
                  {Math.abs(totalLossPnl) > 0 ? (totalWinPnl / Math.abs(totalLossPnl)).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1D24] to-background border border-white/5 rounded-2xl p-6 shadow-[0_0_30px_rgba(37,99,235,0.1)] text-center relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3 border border-primary/20">
                <Cpu size={20} className="text-primary" />
              </div>
              <h3 className="text-base font-black text-foreground mb-1">PipVault AI</h3>
              <p className="text-[10px] font-medium text-muted-foreground/80 leading-relaxed">
                AI Analysis coming soon to help you optimize based on this data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}