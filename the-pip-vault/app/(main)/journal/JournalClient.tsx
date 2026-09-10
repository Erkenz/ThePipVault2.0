// src/app/(main)/journal/JournalClient.tsx
"use client";

import React, { useState } from "react";
import { Trade } from "@/types/database";
import { Filter, Calendar, ChevronDown, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Target, Crosshair, Maximize2, Plus, XCircle, ImageOff } from "lucide-react";
import { AddTradeModal } from "@/components/journal/AddTradeModal";
import { DeleteTradeModal } from "@/components/journal/DeleteTradeModal";
import { EditTradeModal } from "@/components/journal/EditTradeModal";

export default function JournalClient({ 
  initialTrades,
  userProfile,
  accounts = []
}: { 
  initialTrades: Trade[]; 
  userProfile?: { 
    default_asset_type: string; 
    strategies: string[]; 
    sessions: string[]; 
  };
  accounts?: any[];
}) {
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
      filterType === "WIN" ? (trade.pnl > 0 && !trade.is_breakeven) : 
      (trade.pnl <= 0 && !trade.is_breakeven);

    return matchesPair && matchesType;
  });

  const hasActiveFilters = searchPair !== "" || filterType !== "ALL";

  const clearFilters = () => {
    setSearchPair("");
    setFilterType("ALL");
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-5 lg:p-8 space-y-6">
      
      {/* --- Lightbox voor Chart Zoom --- */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-6xl max-h-[85vh] rounded overflow-hidden shadow-2xl bg-transparent">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxImage} 
              alt="Expanded Chart View" 
              className="max-w-full max-h-[85vh] object-contain rounded" 
            />
          </div>
        </div>
      )}

      {/* --- Header Block --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Trade Journal
          </h1>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">
            Operational ledger and execution reports.
          </p>
        </div>
        
        {/* New Trade Button */}
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="flex items-center gap-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus size={14} />
          <span>New Trade</span>
        </button>
      </div>

      {/* --- Filter & Search Bar (Vercel Style) --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200 rounded-md p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400 pr-3 border-r border-zinc-200">
            <Filter size={14} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Filters</span>
          </div>

          <div className="flex bg-zinc-100 rounded-md p-0.5 border border-zinc-200">
            {(["ALL", "WIN", "LOSS"] as const).map((type) => {
              const isActive = filterType === type;
              const activeColor = 
                type === "WIN" ? "text-emerald-700 bg-white shadow-sm font-semibold" : 
                type === "LOSS" ? "text-red-700 bg-white shadow-sm font-semibold" : 
                "text-zinc-900 bg-white shadow-sm font-semibold";
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                    isActive ? activeColor : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Date Inputs */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600">
            <Calendar size={13} className="text-zinc-400" />
            <input type="date" className="bg-transparent outline-none text-zinc-800 text-[11px]" />
            <span className="text-zinc-400">-</span>
            <input type="date" className="bg-transparent outline-none text-zinc-800 text-[11px]" />
          </div>

          {/* Session Filter */}
          <button className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 transition-colors">
            <span className="text-[11px]">All Sessions</span>
            <ChevronDown size={13} className="text-zinc-400" />
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters} 
              className="text-zinc-400 hover:text-red-500 transition-colors ml-1" 
              title="Clear Filters"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        <input 
          type="text"
          placeholder="Search Ticker..."
          value={searchPair}
          onChange={(e) => setSearchPair(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1 text-xs text-zinc-805 outline-none focus:bg-white focus:border-zinc-400 transition-all w-full sm:w-40 placeholder:text-zinc-400"
        />
      </div>

      {/* --- Trades Ledger List (Clean SaaS Card Style) --- */}
      <div className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 bg-white rounded-md border border-zinc-200 shadow-sm text-xs font-medium">
            No trades match the active filters.
          </div>
        ) : (
          filteredTrades.map((trade) => {
             const isWin = trade.pnl > 0 && !trade.is_breakeven;
             const isLoss = trade.pnl < 0 && !trade.is_breakeven;
             const isBreakeven = trade.is_breakeven;
             const outcomeText = isBreakeven ? "text-blue-600" : isWin ? "text-emerald-600" : isLoss ? "text-red-600" : "text-zinc-500";
            
            return (
              <div 
                key={trade.id} 
                className="group relative flex flex-col xl:flex-row bg-white border border-zinc-200 hover:border-zinc-300 rounded-md overflow-hidden transition-all duration-200 shadow-sm"
              >
                {/* --- CHART IMAGE PREVIEW --- */}
                <div 
                  className="relative w-full xl:w-[260px] h-[180px] xl:h-auto min-h-[180px] shrink-0 group/image cursor-pointer overflow-hidden bg-zinc-50 border-r border-zinc-200"
                  onClick={() => trade.chart_url && setLightboxImage(trade.chart_url)}
                >
                  {trade.chart_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={trade.chart_url} 
                        alt={trade.pair} 
                        className="absolute -top-[6%] -bottom-[6%] left-0 w-full h-[112%] object-cover opacity-90 group-hover/image:opacity-100 group-hover/image:scale-105 transition-all duration-500" 
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'; 
                        }} 
                      />
                      <div className="absolute inset-0 bg-zinc-950/10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="bg-zinc-950/80 p-2 rounded text-white shadow-sm transform scale-95 group-hover/image:scale-100 transition-all duration-200">
                          <Maximize2 size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-400">
                      <ImageOff className="text-zinc-350 mb-1.5 h-6 w-6" />
                      <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">No Chart Image</span>
                    </div>
                  )}
                  {/* Direction Badge */}
                  <div className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider text-white ${trade.direction === 'LONG' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {trade.direction}
                  </div>
                </div>

                {/* --- Trade Details --- */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative z-10">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h2 className="text-lg font-bold text-zinc-900 tracking-tight uppercase">{trade.pair}</h2>
                        {trade.is_breakeven && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[9px] font-bold text-blue-700 tracking-wider uppercase">
                            Breakeven
                          </span>
                        )}
                        {trade.session && (
                          <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-[9px] font-bold text-zinc-500 tracking-wider uppercase">
                            {trade.session}
                          </span>
                        )}
                        {trade.account_type && (
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-950 text-[9px] font-bold text-zinc-100 tracking-wider uppercase">
                            {trade.account_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-zinc-400" /> 
                          {trade.date ? new Date(trade.date).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : '-'}
                        </div>
                        <div>
                          {trade.date ? new Date(trade.date).toLocaleTimeString('nl-NL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold tracking-tight ${outcomeText}`}>
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <div className="bg-zinc-50 rounded-md p-2.5 border border-zinc-200">
                      <div className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase mb-0.5">Risk Reward</div>
                      <div className="text-xs font-bold text-zinc-800">{trade.rr_ratio || '-'} <span className="text-zinc-400 font-normal">R</span></div>
                    </div>
                    <div className="bg-zinc-50 rounded-md p-2.5 border border-zinc-200">
                      <div className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase mb-0.5">Strategy</div>
                      <div className="text-xs font-bold text-zinc-800 truncate">{trade.setup || '-'}</div>
                    </div>
                    <div className={`rounded-md p-2.5 border ${isWin ? 'bg-emerald-50 border-emerald-200' : isLoss ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-200'}`}>
                      <div className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase mb-0.5">Psychology</div>
                      <div className={`text-xs font-bold ${outcomeText}`}>
                        {trade.emotion || 'Neutral'}
                      </div>
                    </div>
                    <div className="bg-zinc-50 rounded-md p-2.5 border border-zinc-200">
                      <div className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase mb-0.5">Gross PNL</div>
                      <div className="text-xs font-bold text-zinc-800">${trade.pnl_currency?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>

                  {/* Bottom Row: Price Flow & Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-t border-zinc-100 pt-4 mt-auto">
                    
                    {/* Price Flow */}
                    <div className="flex flex-wrap items-center gap-5 w-full md:w-auto">
                      <div>
                        <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block mb-0.5">Entry</span>
                        <span className="text-xs font-bold text-zinc-850">{trade.entry_price || '-'}</span>
                      </div>
                      <div className="w-px h-5 bg-zinc-200 hidden md:block" />
                      <div>
                        <span className="text-[9px] font-bold tracking-wider text-red-500/70 uppercase block mb-0.5">SL</span>
                        <span className="text-xs font-bold text-zinc-850">{trade.stop_loss || '-'}</span>
                      </div>
                      <div className="w-px h-5 bg-zinc-200 hidden md:block" />
                      <div>
                        <span className="text-[9px] font-bold tracking-wider text-emerald-500/70 uppercase block mb-0.5">TP</span>
                        <span className="text-xs font-bold text-zinc-850">{trade.take_profit || '-'}</span>
                      </div>
                      <div className="w-px h-5 bg-zinc-200 hidden md:block" />
                      <div>
                        <span className="text-[9px] font-bold tracking-wider text-blue-500/70 uppercase block mb-0.5">Exit</span>
                        <span className="text-xs font-bold text-blue-650">{trade.exit_price || '-'}</span>
                      </div>
                    </div>

                    {/* Notes & Action Buttons */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 border-t border-zinc-100 md:border-none md:pt-0">
                      <div className="text-xs italic text-zinc-500 max-w-[200px] truncate">
                        {trade.trade_comment || "No detailed notes recorded."}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setTradeToEdit(trade)} 
                          className="p-1.5 rounded bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-250 hover:text-emerald-600 border border-zinc-200 text-zinc-500 transition-all" 
                          title="Edit Trade"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setTradeToDelete(trade)} 
                          className="p-1.5 rounded bg-zinc-50 hover:bg-red-50 hover:border-red-250 hover:text-red-650 border border-zinc-200 text-zinc-500 transition-all" 
                          title="Delete Trade"
                        >
                          <Trash2 size={13} />
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
        <AddTradeModal onClose={() => setIsAddModalOpen(false)} userProfile={userProfile} accounts={accounts} />
      )}
      {/* Edit Trade Modal */}
      {tradeToEdit && (
        <EditTradeModal 
          trade={tradeToEdit} 
          onClose={() => setTradeToEdit(null)} 
          userProfile={userProfile}
          accounts={accounts}
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