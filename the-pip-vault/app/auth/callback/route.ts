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

          await supabase.from('profiles').insert({
            id: user.id,
            first_name: firstName || null,
            last_name: lastName || null,
            role: 'user',
            currency: 'USD',
            starting_equity: 0,
            strategies: ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
            sessions: ["London", "New York", "Tokyo", "Sydney"],
            asset_class: 'forex',
          });

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
  }

  // If code exchange failed, redirect back to login with error message
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
}
