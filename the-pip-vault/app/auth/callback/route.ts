import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

// Helper to ensure a profile exists in public.profiles and determine destination
async function ensureUserProfile(supabase: any, user: any): Promise<string> {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, currency')
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

    return '/onboarding';
  }

  if (!existingProfile.first_name || !existingProfile.last_name || !existingProfile.currency) {
    return '/onboarding';
  }

  return '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = (searchParams.get('type') || 'email') as EmailOtpType;
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // If Supabase redirected with an explicit error parameter
  if (error || error_description) {
    console.error('Supabase auth callback error query param:', error, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error || 'Authentication failed.')}`);
  }

  const supabase = await createClient();
  let authSuccess = false;

  if (token_hash) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!verifyError) {
      authSuccess = true;
    } else {
      console.error('verifyOtp error:', verifyError);
    }
  } else if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      authSuccess = true;
    } else {
      console.error('exchangeCodeForSession error:', exchangeError);
    }
  }

  if (authSuccess) {
    const { data: { user } } = await supabase.auth.getUser();
    let destination = next;

    if (user) {
      destination = await ensureUserProfile(supabase, user);
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

  // If user is already authenticated via session cookies, route them smoothly
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser) {
    const destination = await ensureUserProfile(supabase, currentUser);
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // Neither code nor token_hash in searchParams:
  // When using default Supabase {{ .ConfirmationURL }}, Supabase redirects with a hash fragment (#access_token=...&refresh_token=...).
  // Hash fragments are client-side only and never sent to the server in GET requests.
  // We return a client-side bridge that detects the hash fragment and sets the session via POST /auth/callback.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifying Email - The Pip Vault</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      padding: 32px 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      max-width: 400px;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #09090b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
    p { font-size: 13px; color: #64748b; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Verifying your email...</h2>
    <p>Please wait while we finalize your account setup.</p>
  </div>
  <script>
    (async function() {
      try {
        var hash = window.location.hash;
        if (hash && (hash.indexOf('access_token=') !== -1 || hash.indexOf('refresh_token=') !== -1)) {
          var params = new URLSearchParams(hash.replace(/^#/, ''));
          var accessToken = params.get('access_token');
          var refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            var res = await fetch('/auth/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
            });
            var data = await res.json();
            if (res.ok && data.destination) {
              window.location.href = data.destination;
              return;
            }
          }
        }
      } catch (e) {
        console.error('Client hash verification error:', e);
      }
      window.location.href = '/login?error=' + encodeURIComponent('Authentication failed. Please try again.');
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error || !session) {
      return NextResponse.json({ error: error?.message || 'Failed to establish session' }, { status: 401 });
    }

    const destination = await ensureUserProfile(supabase, session.user);
    return NextResponse.json({ success: true, destination });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
