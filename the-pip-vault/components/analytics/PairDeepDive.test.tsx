import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PairDeepDive, { PairStats } from './PairDeepDive';
import { Trade } from '@/types/database';

const mockTradesEURUSD: Trade[] = [
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
    pnl: 250,
    pnl_currency: 250,
    commission: 5,
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
    pair: 'EURUSD',
    direction: 'SHORT',
    entry_price: 1.09,
    exit_price: 1.093,
    stop_loss: 1.095,
    take_profit: 1.08,
    pnl: -100,
    pnl_currency: -100,
    commission: 5,
    swap: 0,
    setup: 'Reversal',
    emotion: 'Anxious',
    session: 'New York',
    chart_url: null,
    rr_ratio: -1,
    trade_comment: null,
    asset_type: 'forex',
    account_type: 'Live',
    is_breakeven: false,
  },
];

const mockPairStats: PairStats[] = [
  {
    pair: 'EURUSD',
    total: 2,
    wins: 1,
    losses: 1,
    be: 0,
    winRate: 50,
    pnl: 150,
    grossWin: 250,
    grossLoss: 100,
    profitFactor: 2.5,
    avgWin: 250,
    avgLoss: 100,
    expectancy: 75,
    longCount: 1,
    shortCount: 1,
    longWins: 1,
    shortWins: 0,
    longPnl: 250,
    shortPnl: -100,
    longWinRate: 100,
    shortWinRate: 0,
    bestTrade: 250,
    worstTrade: -100,
    fees: 10,
    volumeShare: 66.7,
    bestSession: 'London',
    bestStrategy: 'Breakout',
    avgHoldTimeStr: '1h 15m',
    trades: mockTradesEURUSD,
    sessions: {
      London: { total: 1, wins: 1, pnl: 250 },
      'New York': { total: 1, wins: 0, pnl: -100 },
    },
    strategies: {
      Breakout: { total: 1, wins: 1, pnl: 250 },
      Reversal: { total: 1, wins: 0, pnl: -100 },
    },
    weekdays: {
      Thursday: { total: 1, wins: 1, pnl: 250 },
      Friday: { total: 1, wins: 0, pnl: -100 },
    },
    assetType: 'forex',
  },
  {
    pair: 'GBPJPY',
    total: 1,
    wins: 0,
    losses: 1,
    be: 0,
    winRate: 0,
    pnl: -80,
    grossWin: 0,
    grossLoss: 80,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 80,
    expectancy: -80,
    longCount: 0,
    shortCount: 1,
    longWins: 0,
    shortWins: 0,
    longPnl: 0,
    shortPnl: -80,
    longWinRate: 0,
    shortWinRate: 0,
    bestTrade: -80,
    worstTrade: -80,
    fees: 5,
    volumeShare: 33.3,
    bestSession: 'Tokyo',
    bestStrategy: 'Breakout',
    avgHoldTimeStr: '45m',
    trades: [],
    sessions: {},
    strategies: {},
    weekdays: {},
    assetType: 'forex',
  },
];

describe('PairDeepDive Component', () => {
  it('renders all traded pairs in the selector strip and studio', () => {
    render(<PairDeepDive allTradedPairs={mockPairStats} />);

    // Section header
    expect(screen.getByText(/Traded Pairs Performance & Deep Analytics/i)).toBeInTheDocument();
    expect(screen.getAllByText('EURUSD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('GBPJPY').length).toBeGreaterThanOrEqual(1);

    // Metrics for EURUSD in Asset Studio
    expect(screen.getAllByText(/\+?\$150\.00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('2.50').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/50\.0%/).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to comparison matrix view', () => {
    render(<PairDeepDive allTradedPairs={mockPairStats} />);

    // Click Comparison Matrix tab
    const matrixTab = screen.getByRole('button', { name: /Comparison Matrix/i });
    fireEvent.click(matrixTab);

    // Table view
    expect(screen.getByText(/Cross-Asset Comparison Matrix/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Studio/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders directional edge, session breakdown, and recent trades in inspector studio', () => {
    render(<PairDeepDive allTradedPairs={mockPairStats} initialPair="EURUSD" />);

    // Directional bias section
    expect(screen.getByText(/Directional Bias Studio/i)).toBeInTheDocument();
    expect(screen.getAllByText('LONG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SHORT').length).toBeGreaterThanOrEqual(1);

    // Execution conditions
    expect(screen.getByText(/Execution Sessions on EURUSD/i)).toBeInTheDocument();
    expect(screen.getAllByText('London').length).toBeGreaterThanOrEqual(1);

    // Switch to Trade Log sub-tab
    const tradeLogTab = screen.getByRole('button', { name: /Trade Log/i });
    fireEvent.click(tradeLogTab);

    expect(screen.getAllByText('Breakout').length).toBeGreaterThanOrEqual(1);
  });

  it('switches active symbol when clicking a symbol strip button', () => {
    render(<PairDeepDive allTradedPairs={mockPairStats} />);

    // Click GBPJPY in symbol selector strip
    const gbpButtons = screen.getAllByRole('button', { name: /GBPJPY/i });
    fireEvent.click(gbpButtons[0]);

    // Studio should now reflect GBPJPY
    expect(screen.getAllByText('GBPJPY').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/-\$80\.00/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when no pairs are present', () => {
    render(<PairDeepDive allTradedPairs={[]} />);

    expect(screen.getByText(/No Traded Pairs Recorded Yet/i)).toBeInTheDocument();
  });
});
