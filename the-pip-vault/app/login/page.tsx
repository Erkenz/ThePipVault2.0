// src/app/login/page.tsx
import { loginAction } from './actions';
import { Mail, Lock, ArrowRight, Eye } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      
      {/* De Kosmische Gloed (Pip Vault Stijl) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      {/* Header */}
      <div className="z-10 mb-8 flex flex-col items-center text-center">
        {/* Het originele Pip Vault Logo */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 shadow-xl shadow-primary/25">
          <span className="text-3xl font-extrabold text-white">P</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-foreground">
          The Pip<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">vault</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Access your trading command center
        </p>
      </div>

      {/* De Login Kaart */}
      <div className="z-10 w-full max-w-[420px] rounded-[1.5rem] border border-white/10 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        
        {error && (
          <div className="mb-6 rounded-xl border border-loss/20 bg-loss/10 p-3 text-center text-xs font-medium text-loss">
            {error}
          </div>
        )}

        <form action={loginAction} className="space-y-6">
          
          {/* Email Address */}
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
                placeholder="trader@example.com"
                className="w-full rounded-xl border border-transparent bg-background/80 px-11 py-3.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex h-5 items-center justify-between">
              <label htmlFor="password" className="block text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                Password
              </label>
              <a href="#" className="text-[11px] font-semibold text-primary transition-colors hover:text-violet-400">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground/60">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-transparent bg-background/80 px-11 py-3.5 text-sm font-medium tracking-widest text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
              <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground/60 transition-colors hover:text-foreground">
                <Eye size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Authenticate Button */}
          <button 
            type="submit" 
            className="group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:opacity-90 active:scale-[0.98]"
          >
            <span>Authenticate</span>
            <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
          </button>

        </form>
      </div>

      {/* Footer Link */}
      <div className="z-10 mt-8 text-sm font-medium text-muted-foreground">
        Not a member? <a href="#" className="font-semibold text-primary transition-colors hover:text-violet-400">Initiate Access</a>
      </div>

    </div>
  );
}