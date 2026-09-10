'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  User, 
  Wallet, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { completeOnboardingAction, OnboardingInput } from './actions';

interface OnboardingClientProps {
  initialData: {
    email: string;
    first_name: string;
    last_name: string;
    currency: string;
    starting_equity: number;
    asset_class: string;
    strategies: string[];
    sessions: string[];
  };
}

const currencyOptions = [
  { label: 'USD ($)', value: 'USD', symbol: '$' },
  { label: 'EUR (€)', value: 'EUR', symbol: '€' },
  { label: 'GBP (£)', value: 'GBP', symbol: '£' },
  { label: 'JPY (¥)', value: 'JPY', symbol: '¥' },
  { label: 'AUD (A$)', value: 'AUD', symbol: 'A$' },
  { label: 'CAD (C$)', value: 'CAD', symbol: 'C$' },
  { label: 'CHF (Fr)', value: 'CHF', symbol: 'Fr' },
];

const assetClassOptions = [
  { label: 'Forex', value: 'forex', desc: 'Currencies & Metals' },
  { label: 'Futures', value: 'futures', desc: 'Indices & Commodities' },
];

const popularSessions = ['London', 'New York', 'Tokyo', 'Sydney'];

const popularStrategies = [
  'Trend Continuation',
  'Reversal',
  'Breakout',
  'RSI Divergence',
];

export default function OnboardingClient({ initialData }: OnboardingClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(initialData.first_name);
  const [lastName, setLastName] = useState(initialData.last_name);
  const [currency, setCurrency] = useState(initialData.currency);
  const [startingEquity, setStartingEquity] = useState<number | string>(initialData.starting_equity);
  const [assetClass, setAssetClass] = useState(initialData.asset_class);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(initialData.sessions);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(initialData.strategies);
  const [customStrategy, setCustomStrategy] = useState('');

  // Currency symbol helper
  const currentCurrencySymbol = currencyOptions.find((c) => c.value === currency)?.symbol || '$';

  // Session toggle
  const toggleSession = (session: string) => {
    if (selectedSessions.includes(session)) {
      setSelectedSessions(selectedSessions.filter((s) => s !== session));
    } else {
      setSelectedSessions([...selectedSessions, session]);
    }
  };

  // Strategy toggle
  const toggleStrategy = (strat: string) => {
    if (selectedStrategies.includes(strat)) {
      setSelectedStrategies(selectedStrategies.filter((s) => s !== strat));
    } else {
      setSelectedStrategies([...selectedStrategies, strat]);
    }
  };

  const handleAddCustomStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customStrategy.trim();
    if (!val) return;
    if (!selectedStrategies.includes(val)) {
      setSelectedStrategies([...selectedStrategies, val]);
    }
    setCustomStrategy('');
  };

  // Validation
  const canProceedStep1 = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canProceedStep2 = currency && Number(startingEquity) >= 0;

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) {
      toast.error('Please enter both your first and last name.');
      return;
    }
    if (currentStep === 2 && !canProceedStep2) {
      toast.error('Please specify your starting capital.');
      return;
    }
    setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  const handleCompleteOnboarding = async () => {
    if (!canProceedStep1) {
      toast.error('First name and last name are required.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OnboardingInput = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        currency: currency,
        starting_equity: Number(startingEquity) || 0,
        asset_class: assetClass,
        strategies: selectedStrategies,
        sessions: selectedSessions,
      };

      const result = await completeOnboardingAction(payload);

      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success(`Welcome to The Pip Vault, ${firstName}! Your account is ready.`);
        window.location.href = '/dashboard';
      }
    } catch {
      toast.error('Failed to complete setup. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 border border-zinc-900 text-white font-bold text-sm shadow-sm">
          P
        </div>
        <span className="font-bold tracking-tight text-base text-slate-900">
          ThePip<span className="text-slate-400">Vault</span>
        </span>
      </div>

      {/* Main Wizard Card */}
      <div className="w-full max-w-[560px] bg-white border border-slate-200 rounded-lg p-7 sm:p-10 shadow-sm space-y-6">
        {/* Step Progress Tracker */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              Step {currentStep} of 3
            </span>
            <span className="text-slate-400 font-medium">
              {currentStep === 1 && 'Profile Information'}
              {currentStep === 2 && 'Trading Capital & Currency'}
              {currentStep === 3 && 'Trading Style & Sessions'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 1 ? 'bg-zinc-950' : 'bg-slate-100'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 2 ? 'bg-zinc-950' : 'bg-slate-100'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep === 3 ? 'bg-zinc-950' : 'bg-slate-100'
              }`}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: PERSONAL DETAILS */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Let's set up your profile
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Welcome to The Pip Vault! Tell us your name so we can personalize your trading command center.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Vance"
                    required
                    className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Account Email</div>
                  <div className="text-slate-500 text-[11px] font-mono">{initialData.email}</div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <Check size={14} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: TRADING CAPITAL & CURRENCY */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Trading capital & currency
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Choose your base currency and starting equity to configure your analytics and performance curve.
              </p>
            </div>

            <div className="space-y-4">
              {/* Currency Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Account Base Currency
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {currencyOptions.map((curr) => (
                    <button
                      key={curr.value}
                      type="button"
                      onClick={() => setCurrency(curr.value)}
                      className={`px-3 py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                        currency === curr.value
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Capital Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  Starting Balance / Equity
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currentCurrencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={startingEquity}
                    onChange={(e) => setStartingEquity(e.target.value)}
                    placeholder="10000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  This sets your initial baseline balance on the performance dashboard.
                </span>
              </div>

              {/* Primary Market */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Primary Asset Class
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {assetClassOptions.map((asset) => (
                    <button
                      key={asset.value}
                      type="button"
                      onClick={() => setAssetClass(asset.value)}
                      className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                        assetClass === asset.value
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{asset.label}</div>
                      <div className={`text-[10px] ${assetClass === asset.value ? 'text-slate-300' : 'text-slate-400'}`}>
                        {asset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: TRADING STYLE & SESSIONS */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Trading sessions & strategies
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Select the market sessions and setups you trade most often. You can modify these anytime in Settings.
              </p>
            </div>

            <div className="space-y-4">
              {/* Sessions */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Preferred Trading Sessions
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSessions.map((session) => {
                    const isSelected = selectedSessions.includes(session);
                    return (
                      <button
                        key={session}
                        type="button"
                        onClick={() => toggleSession(session)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${session}` : `+ ${session}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strategies */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Strategies & Playbook
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularStrategies.map((strat) => {
                    const isSelected = selectedStrategies.includes(strat);
                    return (
                      <button
                        key={strat}
                        type="button"
                        onClick={() => toggleStrategy(strat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${strat}` : `+ ${strat}`}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Strategy Form */}
                <form onSubmit={handleAddCustomStrategy} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customStrategy}
                    onChange={(e) => setCustomStrategy(e.target.value)}
                    placeholder="Add custom strategy..."
                    className="flex-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!customStrategy.trim()}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 text-slate-700 text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* NAVIGATION FOOTER */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteOnboarding}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ml-auto"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>{isSubmitting ? 'Finalizing...' : 'Complete Setup'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
