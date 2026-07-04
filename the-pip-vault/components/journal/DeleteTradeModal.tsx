// src/components/journal/DeleteTradeModal.tsx
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
      setIsDeleting(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden text-center p-6">
        
        {/* Warning Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-200 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-650" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1.5">
          Delete Execution?
        </h2>
        <p className="text-xs text-slate-500 mb-6 font-medium">
          Are you sure you want to permanently delete the <span className="text-red-600 font-bold">{tradePair}</span> execution record? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-75 transition-all"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}