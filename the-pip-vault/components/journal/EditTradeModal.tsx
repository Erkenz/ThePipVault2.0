// src/components/journal/EditTradeModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Activity, Crosshair, Wallet, Loader2, Edit3, Calendar } from "lucide-react";
import { updateTradeAction } from "@/app/(main)/journal/actions";
import { Trade } from "@/types/database";
import CustomSelect from "./CustomSelect";


export function EditTradeModal({ 
  trade, 
  onClose,
  userProfile,
  accounts = []
}: { 
  trade: Trade; 
  onClose: () => void; 
  userProfile?: { 
    strategies: string[]; 
    sessions: string[]; 
  };
  accounts?: any[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State: Pre-filled met de data van de specifieke trade
  const [formData, setFormData] = useState({
    pair: trade.pair || "",
    date: trade.date ? new Date(trade.date).toISOString().slice(0, 16) : "",
    exit_date: trade.exit_date ? new Date(trade.exit_date).toISOString().slice(0, 16) : "",
    direction: trade.direction as "LONG" | "SHORT",
    account_id: trade.account_id || "",
    account_type: trade.account_type || "",
    session: trade.session || "London",
    asset_type: trade.asset_type || "forex",
    entry_price: trade.entry_price?.toString() || "",
    stop_loss: trade.stop_loss?.toString() || "",
    take_profit: trade.take_profit?.toString() || "",
    exit_price: trade.exit_price?.toString() || "",
    pnl_currency: trade.pnl_currency?.toString() || "",
    commission: trade.commission?.toString() || "0",
    swap: trade.swap?.toString() || "0",
    setup: trade.setup || "Trend Continuation",
    emotion: trade.emotion || "Neutral",
    chart_url: trade.chart_url || "",
    trade_comment: trade.trade_comment || "",
    is_breakeven: trade.is_breakeven || false,
  });

  // LOGICA: Exact hetzelfde als de AddTradeModal
  const isJPY = (formData.pair || "").toUpperCase().includes("JPY");
  let multiplier = 10000;
  if (formData.asset_type.toLowerCase() === "futures") multiplier = 1;
  else if (isJPY) multiplier = 100;

  const unitLabel = formData.asset_type.toLowerCase() === "futures" ? "Points" : "Pips";

  const entry = parseFloat(formData.entry_price) || 0;
  const sl = parseFloat(formData.stop_loss) || 0;
  const tp = parseFloat(formData.take_profit) || 0;
  
  const riskRaw = Math.abs(entry - sl) * multiplier;
  const rewardRaw = Math.abs(tp - entry) * multiplier;
  
  const risk = riskRaw > 0 ? riskRaw.toFixed(1) : "0";
  const reward = rewardRaw > 0 ? rewardRaw.toFixed(1) : "0";
  const rrRatio = riskRaw > 0 ? (rewardRaw / riskRaw).toFixed(2) : "0";

  const grossPnl = parseFloat(formData.pnl_currency) || 0;
  const commission = parseFloat(formData.commission) || 0;
  const swap = parseFloat(formData.swap) || 0;
  const netPnl = (grossPnl - commission - swap).toFixed(2);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const selectedAcc = accounts.find(a => a.id === formData.account_id);
    const payload = {
      ...formData,
      entry_price: parseFloat(formData.entry_price),
      stop_loss: parseFloat(formData.stop_loss),
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      pnl_currency: parseFloat(formData.pnl_currency) || 0,
      commission: parseFloat(formData.commission) || 0,
      swap: parseFloat(formData.swap) || 0,
      pnl: parseFloat(netPnl),
      rr_ratio: parseFloat(rrRatio),
      date: new Date(formData.date).toISOString(),
      exit_date: formData.exit_date ? new Date(formData.exit_date).toISOString() : null,
      asset_type: formData.asset_type.toLowerCase(),
      is_breakeven: formData.is_breakeven,
      account_id: formData.account_id || null,
      account_type: selectedAcc ? `${selectedAcc.name} (${selectedAcc.type})` : formData.account_type,
    };

    const result = await updateTradeAction(trade.id, payload);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-[800px] bg-white border border-slate-200 rounded-md shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Execution</h2>
              <p className="text-xs text-slate-500 font-medium">Modify trade details for {trade.pair}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="relative overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <form id="edit-trade-form" onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* --- 1. MARKET CONTEXT --- */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 pb-1 border-b border-slate-100">
                <Activity size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Market Context</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pair / Ticker</label>
                  <input 
                    required 
                    name="pair" 
                    value={formData.pair} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all uppercase" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direction</label>
                  <div className="flex gap-2.5 h-[34px]">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, direction: "LONG"})} 
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${
                        formData.direction === "LONG" 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" 
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <TrendingUp size={14} /> Long
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, direction: "SHORT"})} 
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${
                        formData.direction === "SHORT" 
                          ? "bg-red-50 border-red-300 text-red-750 shadow-sm" 
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <TrendingDown size={14} /> Short
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session</label>
                  <CustomSelect name="session" value={formData.session} options={userProfile?.sessions && userProfile.sessions.length > 0 ? userProfile.sessions : ["London", "New York", "Tokyo", "Sydney"]} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Class</label>
                  <CustomSelect name="asset_type" value={formData.asset_type} options={["Forex", "Futures"]} onChange={handleChange} />
                </div>
              </div>

              {/* Custom Styled Datetime Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry Time</label>
                  <div className="relative flex items-center">
                    <Calendar size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input 
                      required 
                      type="datetime-local" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exit Time</label>
                  <div className="relative flex items-center">
                    <Calendar size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input 
                      type="datetime-local" 
                      name="exit_date" 
                      value={formData.exit_date} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* --- 2. EXECUTION & RISK --- */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 pb-1 border-b border-slate-100">
                <Crosshair size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Execution & Risk</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry Price</label>
                  <input 
                    required 
                    type="number" 
                    step="any" 
                    name="entry_price" 
                    value={formData.entry_price} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stop Loss</label>
                  <input 
                    required 
                    type="number" 
                    step="any" 
                    name="stop_loss" 
                    value={formData.stop_loss} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-red-500 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Take Profit</label>
                  <input 
                    type="number" 
                    step="any" 
                    name="take_profit" 
                    value={formData.take_profit} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-emerald-500 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exit Price</label>
                  <input 
                    type="number" 
                    step="any" 
                    name="exit_price" 
                    value={formData.exit_price} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-slate-400 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all" 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md p-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <div>Risk: <span className="text-slate-800 ml-1.5">{risk}</span> <span className="text-[9px] text-slate-400 font-medium">{unitLabel}</span></div>
                <div>Reward: <span className="text-slate-800 ml-1.5">{reward}</span> <span className="text-[9px] text-slate-400 font-medium">{unitLabel}</span></div>
                <div>Plan R:R: <span className="text-slate-900 font-bold ml-1.5">{rrRatio}</span></div>
              </div>
            </section>

            {/* --- 3. OUTCOME --- */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 pb-1 border-b border-slate-100">
                <Wallet size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Outcome (USD)</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-md border border-slate-200 border-dashed bg-slate-50">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross P&L</label>
                  <input 
                    required 
                    type="number" 
                    step="any" 
                    name="pnl_currency" 
                    value={formData.pnl_currency} 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b border-slate-200 px-0 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comm.</label>
                  <input 
                    type="number" 
                    step="any" 
                    name="commission" 
                    value={formData.commission} 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b border-slate-200 px-0 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Swap</label>
                  <input 
                    type="number" 
                    step="any" 
                    name="swap" 
                    value={formData.swap} 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b border-slate-200 px-0 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net P&L</label>
                  <div className={`w-full py-1 text-base font-bold tracking-tight flex items-center ${
                    parseFloat(netPnl) > 0 
                      ? 'text-emerald-600' 
                      : parseFloat(netPnl) < 0 
                        ? 'text-red-650' 
                        : 'text-slate-800'
                  }`}>
                    {parseFloat(netPnl) > 0 ? '+' : ''}${netPnl}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pl-1">
                <input 
                  type="checkbox" 
                  id="is_breakeven" 
                  name="is_breakeven" 
                  checked={formData.is_breakeven} 
                  onChange={(e) => setFormData({ ...formData, is_breakeven: e.target.checked })}
                  className="rounded border-slate-200 text-slate-900 focus:ring-slate-400 h-4 w-4 bg-slate-50 outline-none cursor-pointer" 
                />
                <label htmlFor="is_breakeven" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                  Mark this trade as Breakeven
                </label>
              </div>
            </section>

            {/* --- 4. PSYCHOLOGY & NOTES --- */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setup</label>
                  <CustomSelect name="setup" value={formData.setup} options={userProfile?.strategies && userProfile.strategies.length > 0 ? userProfile.strategies : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"]} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emotion</label>
                  <CustomSelect name="emotion" value={formData.emotion} options={["Neutral", "Confident", "Anxious", "FOMO", "Revenge Trading"]} onChange={handleChange} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</label>
                  <CustomSelect
                    name="account_id"
                    value={formData.account_id}
                    options={accounts.map(a => ({ label: `${a.name} (${a.type} · ${a.currency})`, value: a.id }))}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart URL</label>
                  <input 
                    name="chart_url" 
                    value={formData.chart_url} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-400" 
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                  <textarea 
                    name="trade_comment" 
                    value={formData.trade_comment} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all resize-none placeholder:text-slate-400" 
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="relative flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-md">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading} 
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-trade-form" 
            disabled={isLoading} 
            className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-75 transition-all"
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            Update Execution
          </button>
        </div>

      </div>
    </div>
  );
}