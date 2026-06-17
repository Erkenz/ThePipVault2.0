"use client";

import { useState, useRef, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Activity, Crosshair, Wallet, Loader2, ChevronDown, Edit3, Calendar } from "lucide-react";
import { updateTradeAction } from "@/app/(main)/journal/actions";
import { Trade } from "@/types/database";

// Plak hier de CustomSelect component exact zoals uit AddTradeModal.tsx!
const CustomSelect = ({ name, value, options, onChange }: any) => { /* ... exact zelfde code als in AddTradeModal ... */ 
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div ref={dropdownRef} className="relative w-full">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full flex justify-between items-center bg-background/50 border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground outline-none transition-all backdrop-blur-sm ${isOpen ? "border-primary/50 ring-1 ring-primary/30" : "border-border/50 hover:border-white/20"}`}>
        <span>{value || "Selecteer..."}</span><ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-card/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt: string) => (
              <div key={opt} onClick={() => { onChange({ target: { name, value: opt } }); setIsOpen(false); }} className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === opt ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>{opt}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function EditTradeModal({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State: Pre-filled met de data van de specifieke trade
  const [formData, setFormData] = useState({
    pair: trade.pair || "",
    date: trade.date ? new Date(trade.date).toISOString().slice(0, 16) : "",
    exit_date: trade.exit_date ? new Date(trade.exit_date).toISOString().slice(0, 16) : "",
    direction: trade.direction as "LONG" | "SHORT",
    account_type: trade.account_type || "FTMO 50K (Funded)",
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
    };

    // Aangepaste action call!
    const result = await updateTradeAction(trade.id, payload);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[850px] bg-card/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 shadow-lg shadow-primary/30">
              <Edit3 className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Edit Execution</h2>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">Modify trade details for {trade.pair}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"><X size={20} /></button>
        </div>

        {/* --- FORMULIER INHOUD: Dit blok is qua HTML exáct gelijk aan je AddTradeModal formulier! --- */}
        <div className="relative overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <form id="edit-trade-form" onSubmit={handleSubmit} className="space-y-10">
            {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium backdrop-blur-sm">{error}</div>}

            {/* Voeg hier simpelweg exact de 4 secties <section>...</section> toe uit AddTradeModal.tsx */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Activity size={18} strokeWidth={2.5} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Market Context</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Pair / Ticker</label>
                  <input required name="pair" value={formData.pair} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm font-bold text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all uppercase backdrop-blur-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Direction</label>
                  <div className="flex gap-3 h-[46px]">
                    <button type="button" onClick={() => setFormData({...formData, direction: "LONG"})} className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border backdrop-blur-sm ${formData.direction === "LONG" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "bg-background/50 border-border/50 text-muted-foreground hover:bg-white/5"}`}><TrendingUp size={16} strokeWidth={2.5} /> Long</button>
                    <button type="button" onClick={() => setFormData({...formData, direction: "SHORT"})} className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border backdrop-blur-sm ${formData.direction === "SHORT" ? "bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]" : "bg-background/50 border-border/50 text-muted-foreground hover:bg-white/5"}`}><TrendingDown size={16} strokeWidth={2.5} /> Short</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Account</label><CustomSelect name="account_type" value={formData.account_type} options={["FTMO 50K (Funded)", "Personal Live", "Demo"]} onChange={handleChange} /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Session</label><CustomSelect name="session" value={formData.session} options={["London", "New York", "Tokyo", "Sydney"]} onChange={handleChange} /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Asset Class</label><CustomSelect name="asset_type" value={formData.asset_type} options={["Forex", "Futures"]} onChange={handleChange} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Entry Time</label><div className="relative flex items-center"><Calendar size={16} className="absolute left-4 text-muted-foreground pointer-events-none" /><input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-primary/50 transition-all [color-scheme:dark] backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full" /></div></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Exit Time</label><div className="relative flex items-center"><Calendar size={16} className="absolute left-4 text-muted-foreground pointer-events-none" /><input type="datetime-local" name="exit_date" value={formData.exit_date} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-primary/50 transition-all [color-scheme:dark] backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full" /></div></div>
              </div>
            </section>
            
            <section className="space-y-5">
              <div className="flex items-center gap-2 text-violet-400"><Crosshair size={18} strokeWidth={2.5} /><h3 className="text-xs font-bold uppercase tracking-widest">Execution & Risk</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Entry Price</label><input required type="number" step="any" name="entry_price" value={formData.entry_price} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all backdrop-blur-sm" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Stop Loss</label><input required type="number" step="any" name="stop_loss" value={formData.stop_loss} onChange={handleChange} className="w-full bg-background/50 border border-border/50 border-l-2 border-l-rose-500 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-rose-500/50 transition-all backdrop-blur-sm" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Take Profit</label><input type="number" step="any" name="take_profit" value={formData.take_profit} onChange={handleChange} className="w-full bg-background/50 border border-border/50 border-l-2 border-l-emerald-500 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all backdrop-blur-sm" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Exit Price</label><input type="number" step="any" name="exit_price" value={formData.exit_price} onChange={handleChange} className="w-full bg-background/50 border border-border/50 border-l-2 border-l-primary rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all backdrop-blur-sm" /></div>
              </div>
              <div className="flex items-center justify-between bg-background/30 border border-white/5 rounded-xl p-4 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <div className="text-muted-foreground">Risk: <span className="text-foreground ml-1.5">{risk}</span> <span className="text-[10px] text-muted-foreground/60">{unitLabel}</span></div>
                <div className="text-muted-foreground">Reward: <span className="text-foreground ml-1.5">{reward}</span> <span className="text-[10px] text-muted-foreground/60">{unitLabel}</span></div>
                <div className="text-muted-foreground">Plan R:R: <span className="text-primary ml-1.5">{rrRatio}</span></div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-2 text-emerald-400"><Wallet size={18} strokeWidth={2.5} /><h3 className="text-xs font-bold uppercase tracking-widest">Outcome (USD)</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-white/10 border-dashed bg-background/20 backdrop-blur-sm">
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Gross P&L</label><input required type="number" step="any" name="pnl_currency" value={formData.pnl_currency} onChange={handleChange} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-sm font-medium outline-none focus:border-primary transition-all" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Comm.</label><input type="number" step="any" name="commission" value={formData.commission} onChange={handleChange} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-sm font-medium outline-none focus:border-primary transition-all" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Swap</label><input type="number" step="any" name="swap" value={formData.swap} onChange={handleChange} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-sm font-medium outline-none focus:border-primary transition-all" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Net P&L</label><div className={`w-full py-2 text-xl font-black tracking-tight ${parseFloat(netPnl) > 0 ? 'text-emerald-500' : parseFloat(netPnl) < 0 ? 'text-rose-500' : 'text-foreground'}`}>{parseFloat(netPnl) > 0 ? '+' : ''}${netPnl}</div></div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Setup</label><CustomSelect name="setup" value={formData.setup} options={["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"]} onChange={handleChange} /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Emotion</label><CustomSelect name="emotion" value={formData.emotion} options={["Neutral", "Confident", "Anxious", "FOMO", "Revenge Trading"]} onChange={handleChange} /></div>
                <div className="space-y-2 md:col-span-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Chart URL</label><input name="chart_url" value={formData.chart_url} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary/50 transition-all backdrop-blur-sm" /></div>
                <div className="space-y-2 md:col-span-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Notes</label><textarea name="trade_comment" value={formData.trade_comment} onChange={handleChange} rows={3} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-4 text-sm font-medium outline-none focus:border-primary/50 transition-all resize-none backdrop-blur-sm" /></div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="relative flex items-center justify-end gap-4 p-6 border-t border-white/5 shrink-0 bg-background/30 backdrop-blur-md rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">Cancel</button>
          <button type="submit" form="edit-trade-form" disabled={isLoading} className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-500 hover:brightness-110 text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70">
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Update Execution
          </button>
        </div>
      </div>
    </div>
  );
}