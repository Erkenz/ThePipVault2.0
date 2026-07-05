-- Migration to add is_breakeven column to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS is_breakeven boolean NOT NULL DEFAULT false;
