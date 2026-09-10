import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // 1. Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Ensure profile exists in public.profiles table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const rawName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string;
          const nameParts = rawName.trim().split(' ');
          const firstName = nameParts[0] || user.email?.split('@')[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          await supabase.from('profiles').insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            role: 'user',
            currency: 'USD',
            starting_equity: 0,
            strategies: ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
            sessions: ["London", "New York", "Tokyo", "Sydney"],
            asset_class: 'forex',
          });
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If code exchange failed, redirect back to login with error message
  return NextResponse.redirect(`${origin}/login?error=Google authentication failed`);
}
