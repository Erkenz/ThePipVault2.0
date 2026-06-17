"use client";

import { useState } from 'react';
import { registerAction } from './actions';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Aparte states voor beide wachtwoord velden
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMessage(null);
    
    const result = await registerAction(formData);
    
    if (result?.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="z-10 mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 shadow-xl shadow-primary/25">
          <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-foreground">
          Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Vault</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Create your secure trading identity
        </p>
      </div>

      <div className="z-10 w-full max-w-[420px] rounded-[1.5rem] border border-white/10 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form action={onSubmit} className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2">
            <div className="flex h-5 items-center">
              <label htmlFor="email" className="block text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                Email Address
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground/60">
                <Mail size={18} strokeWidth={2} />
              </div>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                disabled={isLoading}
                placeholder="trader@example.com"
                className="w-full rounded-xl border border-transparent bg-background/80 px-11 py-3.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Wachtwoord */}
          <div className="space-y-2">
            <div className="flex h-5 items-center justify-between">
              <label htmlFor="password" className="block text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                Secure Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground/60">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full rounded-xl border border-transparent bg-background/80 px-11 py-3.5 text-sm font-medium tracking-widest text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Bevestig Wachtwoord */}
          <div className="space-y-2">
            <div className="flex h-5 items-center justify-between">
              <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                Verify Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground/60">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"} 
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full rounded-xl border border-transparent bg-background/80 px-11 py-3.5 text-sm font-medium tracking-widest text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <>
                <span>Initialize Account</span>
                <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

        </form>
      </div>

      <div className="z-10 mt-8 text-sm font-medium text-muted-foreground">
        Already registered? <Link href="/login" className="font-semibold text-primary transition-colors hover:text-violet-400">Authenticate Here</Link>
      </div>

    </div>
  );
}