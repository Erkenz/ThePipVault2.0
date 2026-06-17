"use client";

import { useState } from "react";
import { Trade } from "@/types/database";
import { Filter, Calendar, ChevronDown, ExternalLink, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Target, Crosshair, Maximize2, Plus, XCircle, ImageOff } from "lucide-react";
import Image from "next/image";
import { AddTradeModal } from "@/components/journal/AddTradeModal";
import { DeleteTradeModal } from "@/components/journal/DeleteTradeModal";
import { EditTradeModal } from "@/components/journal/EditTradeModal";

export default function JournalClient({ initialTrades }: { initialTrades: Trade[] }) {
  const [searchPair, setSearchPair] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null); 

  // Basis Filter Logica
  const filteredTrades = initialTrades.filter((trade) => {
    const matchesPair = trade.pair?.toLowerCase().includes(searchPair.toLowerCase()) ?? false;
    const matchesType = 
      filterType === "ALL" ? true : 
      filterType === "WIN" ? trade.pnl > 0 : 
      trade.pnl <= 0;

    return matchesPair && matchesType;
  });

  const hasActiveFilters = searchPair !== "" || filterType !== "ALL";

  const clearFilters = () => {
    setSearchPair("");
    setFilterType("ALL");
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10">
      
      {/* --- Lightbox voor Chart Zoom --- */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative w-full max-w-7xl h-[90vh] rounded-xl overflow-hidden shadow-2xl">
            {/* FIX: Hier gebruiken we nu ook een standaard img tag in plaats van next/image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxImage} 
              alt="Expanded Chart" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>
      )}
      {/* --- Header Block --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-black italic tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Trade Journal
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
            Detailed ledger of your trading activity.
            </p>
        </div>
        
        {/* Pip Vault Premium Button */}
        <button onClick={() => setIsAddModalOpen(true)} className="group flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:opacity-90 active:scale-[0.98]">
            <Plus size={18} strokeWidth={2.5} className="transition-transform duration-300 group-hover:rotate-90" />
            <span>New Trade</span>
        </button>
        </div>

      {/* --- Filter & Search Bar (Sticky & Glassmorphic) --- */}
      <div className="sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4 bg-card/60 border border-white/5 rounded-2xl p-4 mb-8 backdrop-blur-xl shadow-lg shadow-background/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground pr-4 border-r border-white/10">
            <Filter size={18} />
            <span className="text-xs font-bold tracking-widest uppercase">Filters</span>
          </div>

          <div className="flex bg-background/80 rounded-lg p-1 border border-white/5">
            {(["ALL", "WIN", "LOSS"] as const).map((type) => {
              const isActive = filterType === type;
              const activeColor = type === "WIN" ? "text-emerald-400 bg-emerald-500/20" : type === "LOSS" ? "text-rose-400 bg-rose-500/20" : "text-blue-400 bg-blue-500/20";
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${isActive ? activeColor : "text-muted-foreground hover:text-foreground"}`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Dummy UI voor Date Inputs [color-scheme:dark] */}
          <div className="flex items-center gap-2 bg-background/80 border border-white/5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground">
            <Calendar size={16} />
            <input type="date" className="bg-transparent outline-none [color-scheme:dark]" />
            <span>-</span>
            <input type="date" className="bg-transparent outline-none [color-scheme:dark]" />
          </div>

          {/* Dummy Session Filter */}
          <button className="flex items-center gap-3 bg-background/80 border border-white/5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span>All Sessions</span>
            <ChevronDown size={16} />
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-muted-foreground hover:text-rose-500 transition-colors ml-2" title="Clear Filters">
              <XCircle size={20} />
            </button>
          )}
        </div>

        <input 
          type="text"
          placeholder="Search Pair..."
          value={searchPair}
          onChange={(e) => setSearchPair(e.target.value)}
          className="bg-background/80 border border-white/5 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* --- Trades Ledger List --- */}
      <div className="space-y-6">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-card/20 rounded-3xl border border-white/5">
            No trades found matching your filters.
          </div>
        ) : (
          filteredTrades.map((trade) => {
            // Dynamische styling gebaseerd op outcome (Win/Loss/BE)
            const isWin = trade.pnl > 0;
            const isLoss = trade.pnl < 0;
            const outcomeColor = isWin ? "emerald" : isLoss ? "rose" : "blue";
            const outcomeText = isWin ? "text-emerald-500" : isLoss ? "text-rose-500" : "text-blue-500";
            
            return (
              <div 
                key={trade.id} 
                className="group relative flex flex-col xl:flex-row bg-card/60 backdrop-blur-md border border-border/40 hover:border-primary/20 hover:bg-card/90 rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                {/* Dynamische Glow Radial Background op hover */}
                <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-${outcomeColor}-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* --- CHART IMAGE PREVIEW & LIGHTBOX --- */}
                    <div 
                    className="relative w-full xl:w-[280px] h-[200px] xl:h-auto shrink-0 group/image cursor-pointer overflow-hidden bg-[#15181F]"
                    onClick={() => trade.chart_url && setLightboxImage(trade.chart_url)}
                    >
                    {trade.chart_url ? (
                        <>
                        {/* We gebruiken hier een reguliere img tag om HTML-wrappers van TradingView vloeibaar op te vangen */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={trade.chart_url} 
                            alt={trade.pair} 
                            className="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-110 transition-all duration-700 min-h-[200px] xl:min-h-full" 
                            onError={(e) => { 
                            // Als de link geen direct image-bestand is, herstellen we strak de UI via een fallback
                            e.currentTarget.style.display = 'none'; 
                            }} 
                        />
                        {/* Dark overlay & Expand Icon */}
                        <div className="absolute inset-0 bg-background/30 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-full text-white shadow-lg transform scale-90 group-hover/image:scale-100 transition-all duration-300">
                            <Maximize2 size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        </>
                    ) : (
                        // Fallback block if no chart URL
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1A1A] bg-[url('/grid-pattern.svg')] bg-[length:20px_20px] opacity-80">
                        <ImageOff className="text-muted-foreground/40 mb-2 h-8 w-8" />
                        <span className="text-[10px] font-bold italic tracking-widest text-muted-foreground/60 uppercase">No Chart Data</span>
                        </div>
                    )}
                    {/* Direction Badge */}
                        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-[10px] font-black tracking-widest text-white backdrop-blur-sm ${trade.direction === 'LONG' ? 'bg-emerald-500/90' : 'bg-rose-500/90'}`}>
                            {trade.direction}
                        </div>
                    </div>
                  

                {/* --- Trade Details --- */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black text-foreground tracking-wide">{trade.pair}</h2>
                        {trade.session && (
                          <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                            {trade.session}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} /> 
                            {trade.date ? new Date(trade.date).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                            }) : '-'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            ⏱ {trade.date ? new Date(trade.date).toLocaleTimeString('nl-NL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                            }) : '-'}
                        </div>
                        </div>
                    </div>
                    <div className={`text-3xl font-black tracking-tight ${outcomeText}`}>
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Risk Reward</div>
                      <div className="text-sm font-bold text-foreground">{trade.rr_ratio || '-'} <span className="text-muted-foreground">R</span></div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Strategy</div>
                      <div className="text-sm font-bold text-foreground truncate">{trade.setup || '-'}</div>
                    </div>
                    <div className={`rounded-xl p-4 border ${isWin ? 'bg-emerald-500/5 border-emerald-500/20' : isLoss ? 'bg-rose-500/5 border-rose-500/20' : 'bg-background/50 border-white/5'}`}>
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Psychology</div>
                      <div className={`text-sm font-bold flex items-center gap-1.5 ${outcomeText}`}>
                        {trade.emotion || 'Neutral'}
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Gross PNL</div>
                      <div className="text-sm font-bold text-foreground">${trade.pnl_currency?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>

                  {/* Bottom Row: Price Flow & Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    
                    {/* Price Flow Visualization */}
                    <div className="flex flex-wrap items-center gap-6 md:gap-12 w-full md:w-auto">
                      <div className="group/node cursor-help">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1 transition-colors group-hover/node:text-primary">
                          <ArrowUpRight size={12} /> Entry
                        </div>
                        <div className="text-sm font-bold text-foreground transition-colors group-hover/node:text-primary">{trade.entry_price || '-'}</div>
                      </div>
                      <div className="w-px h-6 bg-white/5 hidden md:block" />
                      <div className="group/node cursor-help">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-rose-500/70 uppercase mb-1 transition-colors group-hover/node:text-rose-500">
                          <Target size={12} /> SL
                        </div>
                        <div className="text-sm font-bold text-rose-500/70 transition-colors group-hover/node:text-rose-500">{trade.stop_loss || '-'}</div>
                      </div>
                      <div className="w-px h-6 bg-white/5 hidden md:block" />
                      <div className="group/node cursor-help">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-500/70 uppercase mb-1 transition-colors group-hover/node:text-emerald-500">
                          <Crosshair size={12} /> TP
                        </div>
                        <div className="text-sm font-bold text-emerald-500/70 transition-colors group-hover/node:text-emerald-500">{trade.take_profit || '-'}</div>
                      </div>
                      <div className="w-px h-6 bg-white/5 hidden md:block" />
                      <div className="group/node cursor-help">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-blue-400/70 uppercase mb-1 transition-colors group-hover/node:text-blue-400">
                          <ArrowDownRight size={12} /> Exit
                        </div>
                        <div className="text-sm font-bold text-blue-400/70 transition-colors group-hover/node:text-blue-400">{trade.exit_price || '-'}</div>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-8 pt-4 border-t border-white/5 md:border-none md:pt-0">
                      <div className="text-xs italic text-muted-foreground/60 flex-1 md:w-48 truncate">
                        💭 {trade.trade_comment || "No detailed notes recorded for this execution."}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all hover:scale-105" title="View details">
                          <ExternalLink size={16} />
                        </button>
                        <button onClick={() => setTradeToEdit(trade)} className="p-2 rounded-full bg-white/5 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-all hover:scale-105" title="Edit Trade">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setTradeToDelete(trade)} className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all hover:scale-105" title="Delete Trade">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Add Trade Modal */}
      {isAddModalOpen && (
        <AddTradeModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {/* Edit Trade Modal */}
      {tradeToEdit && (
        <EditTradeModal 
          trade={tradeToEdit} 
          onClose={() => setTradeToEdit(null)} 
        />
      )}

      {/* Delete Trade Warning Modal */}
      {tradeToDelete && (
        <DeleteTradeModal 
          tradeId={tradeToDelete.id} 
          tradePair={tradeToDelete.pair} 
          onClose={() => setTradeToDelete(null)} 
        />
      )}
    </div>
  );
}