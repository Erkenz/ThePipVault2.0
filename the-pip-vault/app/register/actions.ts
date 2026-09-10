'use server';

import { createClient } from '@/utils/supabase/server';
import { getAdminClient } from '@/utils/supabase/admin';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email || !password || !confirmPassword) {
      return { error: 'Please fill in all fields to create an account.' };
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match. Please verify.' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const supabase = await createClient();

    // Safely resolve the redirect origin
    let origin = 'http://localhost:3000';
    try {
      const headerList = await headers();
      const host = headerList.get('x-forwarded-host') || headerList.get('host');
      const proto = headerList.get('x-forwarded-proto') || (host && host.includes('localhost') ? 'http' : 'https');
      if (host) {
        origin = `${proto}://${host}`;
      }
    } catch {
      // fallback to localhost:3000
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      // Supabase returns 500 when the configured Custom SMTP host/credentials fail
      if (error.status === 500) {
        return {
          error: 'Email delivery failed (SMTP Error 500). Please verify your Mailtrap host (must be live.smtp.mailtrap.io) and credentials in Supabase, or temporarily disable Custom SMTP in Supabase to test.',
        };
      }
      return { error: error.message && error.message !== '{}' ? error.message : 'Registration failed. Please check your credentials and try again.' };
    }

    // Preemptively ensure a profile record exists in public.profiles
    if (data?.user) {
      try {
        const adminClient = getAdminClient();
        await adminClient.from('profiles').upsert({
          id: data.user.id,
          first_name: null,
          last_name: null,
          role: 'user',
          currency: null,
          starting_equity: 10000,
          strategies: ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
          sessions: ["London", "New York", "Tokyo", "Sydney"],
          asset_class: 'forex',
        }, { onConflict: 'id' });
      } catch (profileErr) {
        console.warn('Preemptive profile creation notice:', profileErr);
      }
    }

    // If email confirmation is enabled in Supabase, data.session is null until verified.
    if (!data?.session) {
      return { success: true, needsConfirmation: true, email: email.trim().toLowerCase() };
    }

    // If email confirmation is disabled, user is immediately logged in
    redirect('/dashboard');
  } catch (err: any) {
    // Next.js redirect mechanism throws NEXT_REDIRECT, which must be re-thrown
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    return { error: err?.message || 'An unexpected error occurred during registration.' };
  }
}