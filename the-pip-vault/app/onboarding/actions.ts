'use server';

import { createClient } from '@/utils/supabase/server';
import { getAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface OnboardingInput {
  first_name: string;
  last_name: string;
  currency: string;
  starting_equity: number;
  asset_class: string;
  strategies: string[];
  sessions: string[];
}

export async function completeOnboardingAction(input: OnboardingInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to complete onboarding.' };
  }

  const firstName = input.first_name?.trim();
  const lastName = input.last_name?.trim();
  const currency = input.currency?.trim() || 'USD';
  const startingEquity = Number(input.starting_equity) || 0;
  const assetClass = input.asset_class?.trim() || 'forex';
  const strategies = input.strategies?.length > 0 
    ? input.strategies 
    : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"];
  const sessions = input.sessions?.length > 0 
    ? input.sessions 
    : ["London", "New York", "Tokyo", "Sydney"];

  if (!firstName) {
    return { error: 'First name is required.' };
  }

  if (!lastName) {
    return { error: 'Last name is required.' };
  }

  // 1. Fetch existing profile to preserve any existing role, group_id, etc.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('role, group_id')
    .eq('id', user.id)
    .maybeSingle();

  const profilePayload = {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    currency: currency,
    starting_equity: startingEquity,
    asset_class: assetClass,
    strategies: strategies,
    sessions: sessions,
    role: existingProfile?.role || 'user',
    group_id: existingProfile?.group_id || null,
    updated_at: new Date().toISOString(),
  };

  // 2. Upsert profile so it succeeds whether the row already exists or not
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (profileError) {
    console.error('Onboarding profile upsert error with user client:', profileError);
    // Fallback to admin client if RLS blocked user client upsert
    try {
      const adminClient = getAdminClient();
      const { error: adminProfileError } = await adminClient
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      if (adminProfileError) {
        console.error('Onboarding profile upsert error with admin client:', adminProfileError);
        return { error: `Failed to save profile: ${adminProfileError.message}` };
      }
    } catch (adminErr: any) {
      return { error: `Failed to save profile: ${profileError.message}` };
    }
  }

  revalidatePath('/onboarding');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/settings');
  revalidatePath('/journal');

  return { success: true };
}
