import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();
  let authSuccess = false;

  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!verifyError) {
      authSuccess = true;
    }
  } else if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      authSuccess = true;
    }
  }

  if (authSuccess) {
    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    let destination = next;

    if (user) {
      // 2. Fetch profile from public.profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const rawName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string;
        const nameParts = rawName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await supabase.from('profiles').upsert({
          id: user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          role: 'user',
          currency: null,
          starting_equity: 10000,
          strategies: ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
          sessions: ["London", "New York", "Tokyo", "Sydney"],
          asset_class: 'forex',
        }, { onConflict: 'id' });

        destination = '/onboarding';
      } else if (!existingProfile.first_name || !existingProfile.last_name || !existingProfile.currency) {
        destination = '/onboarding';
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${destination}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${destination}`);
    } else {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // If authentication failed, redirect back to login with error message
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
}

