import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If the user has already completed onboarding, go straight to dashboard
  if (profile?.first_name && profile?.last_name && profile?.currency) {
    redirect('/dashboard');
  }

  // Extract name if provided by Google OAuth metadata
  const googleName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string;
  const nameParts = googleName.trim().split(' ');
  const initialFirstName = profile?.first_name || nameParts[0] || '';
  const initialLastName = profile?.last_name || nameParts.slice(1).join(' ') || '';

  return (
    <OnboardingClient
      initialData={{
        email: user.email || '',
        first_name: initialFirstName,
        last_name: initialLastName,
        currency: profile?.currency || 'USD',
        starting_equity: profile?.starting_equity !== null && profile?.starting_equity !== undefined ? Number(profile.starting_equity) : 10000,
        asset_class: profile?.asset_class || 'forex',
        strategies: profile?.strategies && profile.strategies.length > 0
          ? profile.strategies
          : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
        sessions: profile?.sessions && profile.sessions.length > 0
          ? profile.sessions
          : ["London", "New York", "Tokyo", "Sydney"],
      }}
    />
  );
}
