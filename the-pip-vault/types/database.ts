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
  is_breakeven: boolean;
};

export type Group = {
  id: string;
  name: string;
  mentor_id: string;
  owner_id?: string | null;
  settings?: Record<string, unknown> | null;
  invite_code: string;
  logo_url?: string | null;
  description?: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'mentor' | 'student' | 'admin' | string;
  group_id: string | null;
  currency: string;
  starting_equity: number;
  strategies: string[] | null;
  sessions: string[] | null;
  asset_class: string | null;
  account_types: string | null;
  updated_at?: string;
  email?: string;
};

export type Homework = {
  id: string;
  group_id: string;
  student_id: string | null;
  title: string;
  description: string;
  guidelines?: string | null;
  chart_url: string | null;
  due_date: string; // ISO string
  created_at: string;
};

export type HomeworkSubmission = {
  id: string;
  homework_id: string;
  student_id: string;
  content: string;
  chart_url?: string | null;
  grade?: string | null;
  feedback?: string | null;
  created_at: string;
  student?: Partial<Profile>;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};