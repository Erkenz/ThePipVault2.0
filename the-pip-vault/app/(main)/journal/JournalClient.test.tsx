import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JournalClient from './JournalClient';
import { Trade } from '@/types/database';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/journal',
}));

const mockTrades: Trade[] = [
  {
    id: '1',
    user_id: 'user-1',
    account_id: 'acc-1',
    date: '2026-09-10T10:00:00.000Z',
    exit_date: null,
    pair: 'EURUSD',
    direction: 'LONG',
    entry_price: 1.085,
    exit_price: 1.09,
    stop_loss: 1.08,
    take_profit: 1.095,
    pnl: 250,
    pnl_currency: 250,
    commission: 0,
    swap: 0,
    setup: 'Breakout',
    emotion: 'Disciplined',
    session: 'London',
    chart_url: null,
    rr_ratio: 2,
    trade_comment: 'Good London open entry',
    asset_type: 'forex',
    account_type: 'Live 100k',
    is_breakeven: false,
  },
  {
    id: '2',
    user_id: 'user-1',
    account_id: 'acc-1',
    date: '2026-09-12T14:30:00.000Z',
    exit_date: null,
    pair: 'GBPJPY',
    direction: 'SHORT',
    entry_price: 195.5,
    exit_price: 196.0,
    stop_loss: 196.2,
    take_profit: 194.0,
    pnl: -120,
    pnl_currency: -120,
    commission: 0,
    swap: 0,
    setup: 'Reversal',
    emotion: 'FOMO',
    session: 'New York',
    chart_url: null,
    rr_ratio: -1,
    trade_comment: 'Chased entry too late',
    asset_type: 'forex',
    account_type: 'Live 100k',
    is_breakeven: false,
  },
  {
    id: '3',
    user_id: 'user-1',
    account_id: 'acc-1',
    date: '2026-09-15T08:00:00.000Z',
    exit_date: null,
    pair: 'XAUUSD',
    direction: 'LONG',
    entry_price: 2600,
    exit_price: 2600,
    stop_loss: 2590,
    take_profit: 2620,
    pnl: 0,
    pnl_currency: 0,
    commission: 0,
    swap: 0,
    setup: 'Trend Continuation',
    emotion: 'Calm',
    session: 'Tokyo',
    chart_url: null,
    rr_ratio: 0,
    trade_comment: 'Moved SL to BE',
    asset_type: 'forex',
    account_type: 'Live 100k',
    is_breakeven: true,
  },
];

const mockUserProfile = {
  default_asset_type: 'forex',
  strategies: ['Trend Continuation', 'Reversal', 'Breakout'],
  sessions: ['London', 'New York', 'Tokyo', 'Sydney'],
};

describe('JournalClient Filters', () => {
  it('renders all initial trades and filter controls', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.getByText('XAUUSD')).toBeInTheDocument();

    // Check outcome tabs
    expect(screen.getByRole('button', { name: /^ALL$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^WIN$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^LOSS$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^BE$/i })).toBeInTheDocument();
  });

  it('filters trades by outcome type (WIN, LOSS, BE)', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    // Click WIN filter
    fireEvent.click(screen.getByRole('button', { name: /^WIN$/i }));
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.queryByText('GBPJPY')).not.toBeInTheDocument();
    expect(screen.queryByText('XAUUSD')).not.toBeInTheDocument();

    // Click LOSS filter
    fireEvent.click(screen.getByRole('button', { name: /^LOSS$/i }));
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.queryByText('XAUUSD')).not.toBeInTheDocument();

    // Click BE filter
    fireEvent.click(screen.getByRole('button', { name: /^BE$/i }));
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    expect(screen.queryByText('GBPJPY')).not.toBeInTheDocument();
    expect(screen.getByText('XAUUSD')).toBeInTheDocument();
  });

  it('filters trades by search query across ticker and comment', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    const searchInput = screen.getByPlaceholderText(/Search ticker, setup, notes.../i);

    // Search by ticker
    fireEvent.change(searchInput, { target: { value: 'gbp' } });
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();

    // Search by note comment
    fireEvent.change(searchInput, { target: { value: 'chased' } });
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
  });

  it('filters trades by direction and resets cleanly', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    // Filter SHORT
    fireEvent.click(screen.getByRole('button', { name: 'SHORT' }));
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();

    // Reset button should now be visible
    const resetButton = screen.getByTitle(/Reset all filters/i);
    expect(resetButton).toBeInTheDocument();

    // Click reset
    fireEvent.click(resetButton);
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.getByText('XAUUSD')).toBeInTheDocument();
  });

  it('filters trades by session dropdown', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    // Open session dropdown
    const sessionTrigger = screen.getByRole('button', { name: /All Sessions/i });
    fireEvent.click(sessionTrigger);

    // Select London
    const londonOption = screen.getByRole('button', { name: /^London$/i });
    fireEvent.click(londonOption);

    // Only London trade should show (EURUSD)
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.queryByText('GBPJPY')).not.toBeInTheDocument();
    expect(screen.queryByText('XAUUSD')).not.toBeInTheDocument();
  });

  it('filters trades by strategy dropdown', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    // Open strategy dropdown
    const strategyTrigger = screen.getByRole('button', { name: /All Strategies/i });
    fireEvent.click(strategyTrigger);

    // Select Reversal
    const reversalOption = screen.getByRole('button', { name: /^Reversal$/i });
    fireEvent.click(reversalOption);

    // Only Reversal trade should show (GBPJPY)
    expect(screen.getByText('GBPJPY')).toBeInTheDocument();
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    expect(screen.queryByText('XAUUSD')).not.toBeInTheDocument();
  });

  it('filters trades by date range', () => {
    render(<JournalClient initialTrades={mockTrades} userProfile={mockUserProfile} />);

    const startDateInput = screen.getByTitle('Filter from date');
    const endDateInput = screen.getByTitle('Filter to date');

    // Date range covers only 2026-09-14 to 2026-09-16 (XAUUSD is on 2026-09-15)
    fireEvent.change(startDateInput, { target: { value: '2026-09-14' } });
    fireEvent.change(endDateInput, { target: { value: '2026-09-16' } });

    expect(screen.getByText('XAUUSD')).toBeInTheDocument();
    expect(screen.queryByText('EURUSD')).not.toBeInTheDocument();
    expect(screen.queryByText('GBPJPY')).not.toBeInTheDocument();
  });
});
