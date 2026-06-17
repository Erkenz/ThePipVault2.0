"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteTradeAction } from "@/app/(main)/journal/actions";

export function DeleteTradeModal({ 
  tradeId, 
  tradePair, 
  onClose 
}: { 
  tradeId: string; 
  tradePair: string; 
  onClose: () => void; 
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    const result = await deleteTradeAction(tradeId);
    
    if (result.error) {
      setError(result.error);
      setIsDeleting(false); // Hier alleen nog setIsDeleting gebruiken!
    } else {
      onClose(); // Sluit modal succesvol af
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-card/80 backdrop-blur-2xl border border-rose-500/20 rounded-2xl shadow-2xl overflow-hidden text-center">
        
        {/* Rode gloed in de achtergrond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative p-8">
          {/* Warning Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="h-8 w-8 text-rose-500" strokeWidth={2} />
          </div>

          <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-2">
            Delete Execution?
          </h2>
          <p className="text-sm font-medium text-muted-foreground mb-8">
            Are you sure you want to permanently delete the <span className="text-rose-400 font-bold">{tradePair}</span> execution record? This action cannot be undone.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 disabled:opacity-70"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}