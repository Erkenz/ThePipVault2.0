// src/components/journal/AddTradeModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Activity, Crosshair, Wallet, Loader2, Calculator, Calendar, ChevronDown } from "lucide-react";
import { addTradeAction } from "@/app/(main)/journal/actions";
import CustomSelect from "./CustomSelect";

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  is_default: boolean;
}

export function AddTradeModal({ 
  onClose,
  userProfile,
  accounts = []
}: { 
  onClose: () => void;
  userProfile?: { 
    default_asset_type: string; 
    strategies: string[]; 
    sessions: string[]; 
  };
  accounts?: Account[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-select accounts state
  const [isCopyTrade, setIsCopyTrade] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Pre-select default account or first account on mount
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const defaultAcc = accounts.find(a => a.is_default);
      const initialId = defaultAcc ? defaultAcc.id : accounts[0].id;
      setSelectedAccountId(initialId);
      setSelectedAccountIds([initialId]);
    }
  }, [accounts]);

  // Click outside listener for accounts dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId) 
        : [...prev, accountId]
    );
  };

  // Default values based on settings
  const defaultAsset = userProfile?.default_asset_type 
    ? (userProfile.default_asset_type.toLowerCase() === 'futures' ? 'Futures' : 'Forex') 
    : 'Forex';
  const defaultSession = userProfile?.sessions && userProfile.sessions.length > 0 
    ? userProfile.sessions[0] 
    : 'London';
  const defaultSetup = userProfile?.strategies && userProfile.strategies.length > 0 
    ? userProfile.strategies[0] 
    : 'Trend Continuation';

  // Form State
  const [formData, setFormData] = useState({
    pair: "",
    date: new Date().toISOString().slice(0, 16),
    exit_date: "",
    direction: "LONG" as "LONG" | "SHORT",
    account_type: "FTMO 50K (Funded)",
    session: defaultSession,
    asset_type: defaultAsset,
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    exit_price: "",
    pnl_currency: "",
    commission: "0.00",
    swap: "0.00",
    setup: defaultSetup,
    emotion: "Neutral",
    chart_url: "",
    trade_comment: "",
    is_breakeven: false,
  });

  // --- LOGICA: Multipliers & Risk/Reward ---
  const isJPY = (formData.pair || "").toUpperCase().includes("JPY");
  let multiplier = 10000;
  if (formData.asset_type.toLowerCase() === "futures") {
    multiplier = 1;
  } else if (isJPY) {
    multiplier = 100;
  }

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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeAccountIds = isCopyTrade ? selectedAccountIds : (selectedAccountId ? [selectedAccountId] : []);

    if (activeAccountIds.length === 0) {
      setError("Please select at least one account to log the trade.");
      return;
    }

    setIsLoading(true);
    setError(null);

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
      selectedAccountIds: activeAccountIds, // Pass active accounts array
    };

    const result = await addTradeAction(payload);

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
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Log New Trade</h2>
              <p className="text-xs text-slate-500 font-medium">Record execution parameters and psychology</p>
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
          <form id="add-trade-form" onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* --- 1. MARKET CONTEXT --- */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-855 pb-1 border-b border-slate-100">
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
                    placeholder="EURUSD" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-850 outline-none focus:bg-white focus:border-slate-400 transition-all uppercase" 
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
                          ? "bg-red-50 border-red-305 text-red-700 shadow-sm" 
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-805"
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
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-red-500 rounded-md px-3 py-2 text-xs font-semibold text-slate-805 outline-none focus:bg-white focus:border-slate-400 transition-all" 
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
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-emerald-500 rounded-md px-3 py-2 text-xs font-semibold text-slate-805 outline-none focus:bg-white focus:border-slate-400 transition-all" 
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
                    placeholder="Optional" 
                    className="w-full bg-slate-50 border border-slate-200 border-l-2 border-l-slate-400 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all" 
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
                    placeholder="0.00" 
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
                    placeholder="0.00" 
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
                    placeholder="0.00" 
                    className="w-full bg-transparent border-b border-slate-200 px-0 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net P&L</label>
                  <div className={`w-full py-1 text-base font-bold tracking-tight flex items-center ${
                    parseFloat(netPnl) > 0 
                      ? 'text-emerald-600' 
                      : parseFloat(netPnl) < 0 
                        ? 'text-red-600' 
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account(s)</label>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isCopyTrade}
                        onChange={(e) => setIsCopyTrade(e.target.checked)}
                        className="rounded border-slate-200 text-slate-900 focus:ring-slate-400 h-3.5 w-3.5 bg-slate-50 cursor-pointer"
                      />
                      <span>Copy Trade</span>
                    </label>
                  </div>
                  
                  {!isCopyTrade ? (
                    <CustomSelect
                      name="selectedAccountId"
                      value={selectedAccountId}
                      options={accounts.map(a => ({ label: `${a.name} (${a.type} · ${a.currency})`, value: a.id }))}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                    />
                  ) : (
                    <div className="relative" ref={accountDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className={`w-full flex justify-between items-center bg-slate-50 border rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition-all duration-155 h-[34px] ${
                          isAccountDropdownOpen ? "border-slate-400 bg-white" : "border-slate-200"
                        }`}
                      >
                        <span className="truncate">
                          {selectedAccountIds.length === 0 
                            ? "Select Accounts..." 
                            : `${selectedAccountIds.length} Account(s) Selected (${accounts.filter(a => selectedAccountIds.includes(a.id)).map(a => a.name).join(", ")})`}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isAccountDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isAccountDropdownOpen && (
                        <div className="absolute z-50 bottom-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-md shadow-lg p-2 max-h-[160px] overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
                          {accounts.length === 0 ? (
                            <div className="text-xs text-slate-400 italic p-2 text-center">No accounts found. Please add accounts first.</div>
                          ) : (
                            accounts.map(acc => {
                              const isChecked = selectedAccountIds.includes(acc.id);
                              return (
                                <label key={acc.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none text-xs font-semibold text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleAccountToggle(acc.id)}
                                    className="rounded border-slate-200 text-slate-900 focus:ring-slate-450 h-4 w-4 bg-slate-50 outline-none cursor-pointer"
                                  />
                                  <span>{acc.name} ({acc.type} · {acc.currency})</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart URL</label>
                  <input 
                    name="chart_url" 
                    value={formData.chart_url} 
                    onChange={handleChange} 
                    placeholder="https://www.tradingview.com/x/..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-400" 
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                  <textarea 
                    name="trade_comment" 
                    value={formData.trade_comment} 
                    onChange={handleChange} 
                    placeholder="Trade execution notes..." 
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
            form="add-trade-form" 
            disabled={isLoading} 
            className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-75 transition-all"
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            Save Trade
          </button>
        </div>

      </div>
    </div>
  );
}