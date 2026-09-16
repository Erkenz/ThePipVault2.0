import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsClient from './AnalyticsClient';
import { Trade } from '@/types/database';

const mockTrades: Trade[] = [
  {
    id: 't-1',
    user_id: 'u-1',
    account_id: 'acc-1',
    date: '2026-09-10T10:00:00Z',
    exit_date: '2026-09-10T11:30:00Z',
    pair: 'EURUSD',
    direction: 'LONG',
    entry_price: 1.085,
    exit_price: 1.09,
    stop_loss: 1.08,
    take_profit: 1.095,
    pnl: 200,
    pnl_currency: 200,
    commission: 0,
    swap: 0,
    setup: 'Breakout',
    emotion: 'Confident',
    session: 'London',
    chart_url: null,
    rr_ratio: 2,
    trade_comment: null,
    asset_type: 'forex',
    account_type: 'Live',
    is_breakeven: false,
  },
  {
    id: 't-2',
    user_id: 'u-1',
    account_id: 'acc-1',
    date: '2026-09-11T14:00:00Z',
    exit_date: '2026-09-11T15:00:00Z',
    pair: 'GBPJPY',
    direction: 'SHORT',
    entry_price: 190.0,
    exit_price: 191.0,
    stop_loss: 191.5,
    take_profit: 188.0,
    pnl: -80,
    pnl_currency: -80,
    commission: 0,
    swap: 0,
    setup: 'Reversal',
    emotion: 'FOMO',
    session: 'New York',
    chart_url: null,
    rr_ratio: -1,
    trade_comment: null,
    asset_type: 'forex',
    account_type: 'Live',
    is_breakeven: false,
  },
];

describe('AnalyticsClient Component', () => {
  it('renders overall stats across all trades as default', () => {
    render(<AnalyticsClient trades={mockTrades} />);

    // Total net P&L = 200 - 80 = +$120.00
    expect(screen.getAllByText(/\+?\$120\.00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Account Balance')).toBeInTheDocument();

    // Strategy Performance Matrix is present
    expect(screen.getByText('Strategy Performance Matrix')).toBeInTheDocument();
  });

  it('renders the Traded Pairs Performance & Deep Analytics section at the bottom', () => {
    render(<AnalyticsClient trades={mockTrades} />);

    // Pair deep dive section
    expect(screen.getByText(/Traded Pairs Performance & Deep Analytics/i)).toBeInTheDocument();
    expect(screen.getByText('Asset Studio')).toBeInTheDocument();
    expect(screen.getByText('Comparison Matrix')).toBeInTheDocument();
    expect(screen.getAllByText('EURUSD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('GBPJPY').length).toBeGreaterThanOrEqual(1);
  });
});
