'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please fill in all fields to authenticate.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // We kunnen hier ook custom foutmeldingen mappen op basis van error.code
    return { error: 'Invalid authentication credentials. Please try again.' };
  }

  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, currency')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
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

      redirect('/onboarding');
    }

    if (!profile.first_name || !profile.last_name || !profile.currency) {
      redirect('/onboarding');
    }
  }

  // Success! Redirect to dashboard
  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}