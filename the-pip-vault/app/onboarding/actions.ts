'use server';

import { createClient } from '@/utils/supabase/server';
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

  // 1. Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      currency: currency,
      starting_equity: startingEquity,
      asset_class: assetClass,
      strategies: strategies,
      sessions: sessions,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Onboarding profile update error:', profileError);
    return { error: `Failed to save profile: ${profileError.message}` };
  }

  // 2. Check if user already has an account, if not create their primary account
  const { data: existingAccounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id);

  if (!existingAccounts || existingAccounts.length === 0) {
    const { error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: 'Main Trading Account',
        type: assetClass.toLowerCase() === 'futures' ? 'Futures' : 'Forex',
        start_amount: startingEquity,
        currency: currency,
        status: 'Active',
        is_default: true,
      });

    if (accountError) {
      console.warn('Initial account creation notice:', accountError.message);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/settings');
  revalidatePath('/journal');

  return { success: true };
}
