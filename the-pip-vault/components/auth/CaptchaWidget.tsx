'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, ShieldCheck, Loader2 } from 'lucide-react';
import { getCaptchaChallengeAction } from '@/app/register/actions';
import { CaptchaChallenge } from '@/utils/captcha';

interface CaptchaWidgetProps {
  value: string;
  onChange: (val: string) => void;
  onTokenChange?: (token: string) => void;
  disabled?: boolean;
}

export function CaptchaWidget({
  value,
  onChange,
  onTokenChange,
  disabled = false,
}: CaptchaWidgetProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChallenge = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newChallenge = await getCaptchaChallengeAction();
      setChallenge(newChallenge);
      if (onTokenChange) {
        onTokenChange(newChallenge.token);
      }
    } catch (err) {
      console.error('Failed to load captcha challenge:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onTokenChange]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  return (
    <div className="space-y-2 p-3 bg-slate-50/80 rounded-md border border-slate-200 text-left">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-zinc-950" />
          <span>Security Verification</span>
        </div>
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={disabled || isRefreshing}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          title="Get a new challenge"
        >
          <RotateCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Visual Challenge Container */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center bg-white rounded border border-slate-200 overflow-hidden shadow-xs shrink-0 w-[160px] h-[48px]">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full text-slate-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : challenge?.svg ? (
            <div 
              className="w-full h-full flex items-center justify-center select-none"
              dangerouslySetInnerHTML={{ __html: challenge.svg }}
            />
          ) : (
            <div className="text-[11px] text-slate-400">Failed to load</div>
          )}
        </div>

        {/* User Code Input */}
        <div className="flex-1">
          <input
            type="text"
            id="captchaAnswer"
            name="captchaAnswer"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            required
            disabled={disabled || isLoading}
            placeholder="Enter code"
            maxLength={6}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-900 uppercase placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:border-slate-900 focus:outline-none transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Hidden input storing the signed verification token */}
      <input
        type="hidden"
        name="captchaToken"
        value={challenge?.token || ''}
      />
      <p className="text-[10px] text-slate-400">
        Solve the code above to verify you are a human.
      </p>
    </div>
  );
}
