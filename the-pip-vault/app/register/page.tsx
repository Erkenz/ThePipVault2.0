// src/app/register/page.tsx
"use client";

import { useState } from 'react';
import { registerAction } from './actions';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize Google registration.');
      setIsGoogleLoading(false);
    }
  }

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await registerAction(formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else if (result?.needsConfirmation) {
        setSubmittedEmail(result.email || (formData.get('email') as string) || '');
        setNeedsConfirmation(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-md p-7 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.015)] text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Mail size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Check your email
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            We sent a verification link to <strong className="text-slate-800">{submittedEmail}</strong>. Please click the link in the email to activate your account.
          </p>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-500 text-left space-y-1">
            <div className="font-semibold text-slate-700">Didn't receive the email?</div>
            <div>• Check your spam or junk folder.</div>
            <div>• It can sometimes take a minute or two to arrive.</div>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-zinc-950 hover:bg-zinc-800 py-2.5 text-xs font-semibold text-white uppercase tracking-wider transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50">
      
      {/* Force Autofill overrides via inline style block to bypass WebKit defaults */}
      <style dangerouslySetInnerHTML={{ __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        input:autofill,
        input:autofill:hover,
        input:autofill:focus,
        input:autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      ` }} />

      {/* Centered Register Card Container */}
      <div className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-md p-7 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.015)]">
        
        {/* Logo and Headings */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 border border-zinc-900 text-white font-bold text-sm shadow-sm mb-4">
            P
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access secure databases and active journals.
          </p>
        </div>

        {/* Social Authentication Buttons */}
        <div className="space-y-2 mb-5">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium py-2 rounded-md text-xs shadow-sm cursor-pointer transition-colors"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.35 1 3.39 3.65 1.45 7.51l3.79 2.94C6.15 6.96 8.82 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.52z"/>
                <path fill="#FBBC05" d="M5.24 14.51c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.45 6.99C.62 8.64.15 10.49.15 12.43s.47 3.79 1.3 5.44l3.79-2.94-.04-.42z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.3 1.08-3.9 1.08-3.18 0-5.85-2.04-6.81-4.91L1.8 16.35C3.74 20.21 7.7 23 12 23z"/>
              </svg>
            )}
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t border-slate-150" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">or continue with email</span>
          <div className="flex-1 border-t border-slate-150" />
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-650" />
            <p className="font-semibold leading-normal">{errorMessage}</p>
          </div>
        )}

        <form action={onSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-500">
              Email address
            </label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              disabled={isLoading}
              placeholder="name@example.com"
              className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>

          {/* Secure Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-500">
              Password
            </label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                disabled={isLoading}
                placeholder="Password"
                className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none pr-10 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500">
              Verify password
            </label>
            <div className="relative">
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"} 
                required
                disabled={isLoading}
                placeholder="Verify Password"
                className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none pr-10 transition-all placeholder:text-slate-455 disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex w-full cursor-pointer items-center justify-center gap-1 rounded bg-zinc-950 hover:bg-zinc-900 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75 mt-2 shadow-sm"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>

        </form>

        {/* Toggle Page link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account? <Link href="/login" className="font-bold text-slate-900 hover:text-slate-700 transition-colors">Sign in</Link>
        </div>

      </div>

    </div>
  );
}