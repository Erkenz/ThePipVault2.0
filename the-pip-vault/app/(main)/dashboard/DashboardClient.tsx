// src/app/(main)/dashboard/DashboardClient.tsx
"use client";

import { useState, useRef } from "react";
import { Trade } from "@/types/database";
import { Activity, Plus, ChevronLeft, ChevronRight, Target, CheckCircle2, MinusCircle, Flame, TrendingUp, Wallet, Calendar } from "lucide-react";
import { AddTradeModal } from "@/components/journal/AddTradeModal";

export default function DashboardClient({ trades }: { trades: Trade[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- 1. GLOBALE STATISTIEKEN BEREKENEN ---
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  const totalNetPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossWin = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0);
  
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const profitFactor = grossLoss > 0 ? (grossWin / grossLoss) : grossWin > 0 ? 99.99 : 0;

  // --- 2. CUMULATIVE PNL CURVE ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  let runningPnl = 0;
  const equityData = [{ date: "Start", pnl: 0, cumulative: 0 }];
  
  trades.forEach((trade) => {
    runningPnl += (trade.pnl || 0);
    equityData.push({
      date: trade.date ? new Date(trade.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '',
      pnl: trade.pnl,
      cumulative: runningPnl
    });
  });

  const cumulativeVals = equityData.map(d => d.cumulative);
  const maxEquity = cumulativeVals.length > 0 ? Math.max(...cumulativeVals, 100) * 1.1 : 1000;
  const minEquity = cumulativeVals.length > 0 ? Math.min(...cumulativeVals, 0) * 1.1 : -100;
  const equityRange = maxEquity - minEquity;

  const dataLength = Math.max(1, equityData.length - 1);
  const getSvgX = (index: number) => (index / dataLength) * 1000;
  const getSvgY = (val: number) => 250 - (((val - minEquity) / (equityRange || 1)) * 200);

  let linePath = "";
  let areaPath = "";

  if (equityData.length > 1) {
    equityData.forEach((point, i) => {
      const x = getSvgX(i);
      const y = getSvgY(point.cumulative);
      if (i === 0) {
        linePath += `M ${x},${y}`;
        areaPath += `M ${x},300 L ${x},${y}`;
      } else {
        linePath += ` L ${x},${y}`;
        areaPath += ` L ${x},${y}`;
      }
      if (i === equityData.length - 1) areaPath += ` L ${x},300 Z`; 
    });
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoveredIndex(Math.round(percentage * dataLength));
  };
  
  const handleMouseLeave = () => setHoveredIndex(null);
  const hoveredPoint = hoveredIndex !== null && hoveredIndex >= 0 ? equityData[hoveredIndex] : null;

  // Trades ophalen voor de tooltip op de grafiek
  const hoveredTrades = hoveredPoint && hoveredPoint.date !== "Start" 
    ? trades.filter(t => {
        const tDate = t.date ? new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '';
        return tDate === hoveredPoint.date;
      })
    : [];

  // --- 3. KALENDER LOGICA MET HOVER DETAILS ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const tradesByDay: Record<number, { pnl: number, trades: Trade[] }> = {};
  trades.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const day = d.getDate();
      if (!tradesByDay[day]) tradesByDay[day] = { pnl: 0, trades: [] };
      tradesByDay[day].pnl += t.pnl;
      tradesByDay[day].trades.push(t);
    }
  });

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  // --- 4. STRATEGY & PSYCHOLOGY BEREKENEN ---
  const strategyStats = trades.reduce((acc, t) => {
    const setup = t.setup || "Other";
    if (!acc[setup]) acc[setup] = { pnl: 0, wins: 0, total: 0 };
    acc[setup].total += 1;
    acc[setup].pnl += t.pnl;
    if (t.pnl > 0) acc[setup].wins += 1;
    return acc;
  }, {} as Record<string, { pnl: number, wins: number, total: number }>);

  const emotionStats = trades.reduce((acc, t) => {
    const emo = t.emotion || "Neutral";
    if (!acc[emo]) acc[emo] = { pnl: 0, total: 0 };
    acc[emo].total += 1;
    acc[emo].pnl += t.pnl;
    return acc;
  }, {} as Record<string, { pnl: number, total: number }>);

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Your edge, in numbers.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-white px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} /> Quick Trade
        </button>
      </div>

      {/* --- TOP ROW METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="md:col-span-2 relative bg-white border border-slate-200 rounded-md p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className={`absolute top-0 left-0 right-0 h-1 ${totalNetPnl >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`} />
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Activity size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Net PNL</h3>
          </div>
          <div>
            <div className={`text-4xl font-bold tracking-tight mb-3 ${totalNetPnl >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
              {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex gap-4 text-[11px] font-semibold">
              <span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={12}/> Gross +${grossWin.toFixed(2)}</span>
              <span className="text-red-600 flex items-center gap-1"><TrendingUp size={12} className="rotate-180"/> Loss -${grossLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Win Rate</h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">{winRate.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-zinc-950 rounded-full" style={{ width: `${winRate}%` }} />
          </div>
          <div className="text-xs font-medium text-slate-500">{wins.length}W · {losses.length}L</div>
        </div>

        <div className="md:col-span-1 bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Profit Factor</h3>
          <div className={`text-3xl font-bold mb-2 ${profitFactor > 1.5 ? 'text-emerald-600' : profitFactor > 1 ? 'text-slate-800' : 'text-red-600'}`}>
            {profitFactor.toFixed(2)}
          </div>
          <div className="text-xs font-medium text-slate-500">
            {profitFactor > 2 ? 'Excellent' : profitFactor > 1.2 ? 'Robust edge' : 'Needs improvement'}
          </div>
        </div>

      </div>

      {/* --- MIDDLE ROW: EQUITY CURVE & PERFORMANCE MAP --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* EQUITY CURVE */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col relative select-none overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Equity Curve</h3>
              <div className="text-lg font-bold text-slate-900">Cumulative P&L</div>
            </div>
            <div className="text-xs font-medium text-slate-400">{totalTrades} trades tracked</div>
          </div>
          
          <div ref={containerRef} className="flex-1 relative min-h-[300px] w-full mt-auto rounded-md flex items-end cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
             
             <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-60">
               <div className="flex items-center gap-2"><span className="text-[9px] text-slate-400 font-medium w-8">{maxEquity.toFixed(0)}</span><div className="flex-1 border-t border-slate-200/60 border-dashed" /></div>
               <div className="flex items-center gap-2"><span className="text-[9px] text-slate-400 font-medium w-8">{(maxEquity / 2).toFixed(0)}</span><div className="flex-1 border-t border-slate-200/60 border-dashed" /></div>
               <div className="flex items-center gap-2"><span className="text-[9px] text-slate-400 font-medium w-8">0</span><div className="flex-1 border-t border-slate-200/60 border-dashed" /></div>
             </div>

             {equityData.length > 1 && (
               <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none pl-10">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#areaGrad)" />
                  <path d={linePath} fill="none" stroke="#0f172a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             )}

             {/* Hover Tooltip op de grafiek (Control Surface) */}
             {hoveredIndex !== null && hoveredPoint && (
                <div className="absolute inset-0 z-30 pointer-events-none pl-10">
                  <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-400/50" style={{ left: `${(hoveredIndex / dataLength) * 100}%` }} />
                  <div className="absolute top-0 bg-zinc-950 border border-zinc-900 p-3.5 rounded-md shadow-lg min-w-[180px]" style={{ left: `${(hoveredIndex / dataLength) * 100}%`, transform: (hoveredIndex / dataLength) > 0.65 ? 'translateX(calc(-100% - 16px))' : 'translateX(16px)' }}>
                    <div className="flex items-center gap-2 text-slate-400 mb-3 border-b border-slate-800 pb-1.5">
                      <Calendar size={13} />
                      <span className="text-xs font-semibold text-slate-300">{hoveredPoint.date === "Start" ? "Startkapitaal" : hoveredPoint.date}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Cumulative</div>
                      <div className="text-xl font-bold text-white">
                        ${hoveredPoint.cumulative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* List of Trades on hover */}
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
          
          <div className="flex justify-between mt-4 pl-10 text-[10px] text-slate-400 font-medium relative z-10 pointer-events-none">
            {equityData.length <= 4 ? (
              equityData.map((d, i) => <span key={i}>{d.date}</span>)
            ) : (
              <>
                <span>{equityData[0].date}</span>
                <span>{equityData[Math.floor(equityData.length * 0.33)].date}</span>
                <span>{equityData[Math.floor(equityData.length * 0.66)].date}</span>
                <span>{equityData[equityData.length - 1].date}</span>
              </>
            )}
          </div>
        </div>

        {/* PERFORMANCE MAP (Kalender) */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Performance Map</h3>
              <div className="text-lg font-bold text-slate-900 capitalize">
                {currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-1">
              <button onClick={prevMonth} className="p-1 hover:text-slate-900 text-slate-400 hover:bg-slate-100 transition-all rounded"><ChevronLeft size={16} /></button>
              <button onClick={nextMonth} className="p-1 hover:text-slate-900 text-slate-400 hover:bg-slate-100 transition-all rounded"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="rounded bg-transparent" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayData = tradesByDay[day];
              
              let bgClass = "bg-slate-50 border-slate-200/60 hover:bg-slate-100 text-slate-500";
              let textClass = "text-slate-500";
              let numberColor = "text-slate-700";
              
              if (dayData && dayData.pnl > 0) {
                bgClass = "bg-emerald-50 border-emerald-200 text-emerald-700";
                textClass = "text-emerald-600";
                numberColor = "text-emerald-800 font-bold";
              } else if (dayData && dayData.pnl < 0) {
                bgClass = "bg-red-50 border-red-200 text-red-700";
                textClass = "text-red-650";
                numberColor = "text-red-800 font-bold";
              } else if (dayData && dayData.pnl === 0) {
                bgClass = "bg-slate-100 border-slate-250 text-slate-600";
                textClass = "text-slate-600";
                numberColor = "text-slate-800 font-bold";
              }

              return (
                <div key={day} className="relative group aspect-square">
                  <div className={`w-full h-full rounded border flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass}`}>
                    <span className={`text-[11px] ${dayData ? numberColor : 'text-slate-400'}`}>{day}</span>
                    {dayData && (
                      <span className={`text-[9px] font-bold tracking-tighter mt-0.5 ${textClass}`}>
                        {dayData.pnl > 0 ? '+' : ''}{Math.round(dayData.pnl)}
                      </span>
                    )}
                  </div>

                  {dayData && dayData.trades.length > 0 && (
                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-zinc-900 p-3 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform scale-95 group-hover:scale-100 pointer-events-none">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-800 pb-1">
                        {currentDate.toLocaleString('en-US', { month: 'short' })} {day}
                      </div>
                      <div className="space-y-1.5">
                        {dayData.trades.map(t => (
                          <div key={t.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-200 font-medium">{t.pair}</span>
                            <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold ${textClass}`}>
                        <span>Total:</span>
                        <span>{dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: STRATEGY & PSYCHOLOGY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-slate-400">
            <Target size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Setup Performance</h3>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Edge by strategy</h2>
          
          <div className="space-y-6">
            {Object.entries(strategyStats).sort((a, b) => b[1].pnl - a[1].pnl).map(([setup, stats]) => {
              const setupWinRate = (stats.wins / stats.total) * 100;
              return (
                <div key={setup}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-800">{setup}</span>
                    <div className="text-[10px] font-bold">
                      <span className="text-slate-400 mr-3">{setupWinRate.toFixed(0)}% WR</span>
                      <span className={stats.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>{stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className={`h-full rounded-full ${stats.pnl >= 0 ? 'bg-emerald-650' : 'bg-red-600'}`} style={{ width: `${setupWinRate}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(strategyStats).length === 0 && <div className="text-sm text-slate-400 italic">No strategies logged yet.</div>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-slate-400">
            <Flame size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Psychology Matrix</h3>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-6">P&L by emotional state</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-600 mb-4">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold text-emerald-700">Confident</span>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700 mb-1">
                  {emotionStats["Confident"] ? (emotionStats["Confident"].pnl >= 0 ? '+' : '') + '$' + emotionStats["Confident"].pnl.toFixed(2) : '$0.00'}
                </div>
                <div className="text-[10px] text-slate-400">{emotionStats["Confident"]?.total || 0} trades - Flow State</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <MinusCircle size={16} />
                <span className="text-xs font-bold text-slate-600">Neutral</span>
              </div>
              <div>
                <div className={`text-xl font-bold mb-1 ${emotionStats["Neutral"]?.pnl >= 0 ? 'text-emerald-650' : 'text-red-600'}`}>
                  {emotionStats["Neutral"] ? (emotionStats["Neutral"].pnl >= 0 ? '+' : '') + '$' + emotionStats["Neutral"].pnl.toFixed(2) : '$0.00'}
                </div>
                <div className="text-[10px] text-slate-400">{emotionStats["Neutral"]?.total || 0} trades - Neutral</div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-red-605 mb-4">
                <Flame size={16} className="text-red-500" />
                <span className="text-xs font-bold text-red-700">Greedy</span>
              </div>
              <div>
                <div className="text-xl font-bold text-red-750 mb-1">
                  {emotionStats["Greedy"] ? (emotionStats["Greedy"].pnl >= 0 ? '+' : '') + '$' + emotionStats["Greedy"].pnl.toFixed(2) : '$0.00'}
                </div>
                <div className="text-[10px] text-slate-400">{emotionStats["Greedy"]?.total || 0} trades - Greed</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && (
        <AddTradeModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}