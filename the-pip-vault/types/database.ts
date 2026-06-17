export type Trade = {
  id: string;
  user_id: string;
  account_id: string | null;
  date: string; // ISO string
  exit_date: string | null;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number | null;
  stop_loss: number;
  take_profit: number | null;
  pnl: number; // Net pnl
  pnl_currency: number; // Gross pnl
  commission: number;
  swap: number;
  setup: string | null;
  emotion: string | null;
  session: string | null;
  chart_url: string | null;
  rr_ratio: number | null;
  trade_comment: string | null;
  asset_type: 'forex' | 'futures' | string | null;
  account_type: string | null;
};