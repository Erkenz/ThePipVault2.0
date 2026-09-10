'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProfileUpdateInput {
  first_name: string;
  last_name: string;
  currency: string;
  starting_equity: number;
  strategies: string[];
  sessions: string[];
  asset_class: string;
}

export async function updateProfileSettings(profileData: ProfileUpdateInput) {
  const supabase = await createClient();

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'You must be logged in to update your settings.' };
  }

  // Basic validation
  if (!profileData.first_name?.trim()) {
    return { error: 'First name is required.' };
  }
  if (!profileData.last_name?.trim()) {
    return { error: 'Last name is required.' };
  }

  // Update user profile in Supabase profiles table
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: profileData.first_name.trim(),
      last_name: profileData.last_name.trim(),
      currency: profileData.currency || 'USD',
      starting_equity: Number(profileData.starting_equity) || 0,
      strategies: profileData.strategies || [],
      sessions: profileData.sessions || [],
      asset_class: profileData.asset_class?.toLowerCase() || 'forex',
    })
    .eq('id', user.id);

  if (error) {
    console.error("Supabase Profile Update Error:", error);
    return { error: error.message };
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath('/settings');
  
  return { success: true };
}

export async function resetProfileSettings() {
  const supabase = await createClient();

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to reset your settings.' };
  }

  const defaultStrategies = ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"];
  const defaultSessions = ["London", "New York", "Tokyo", "Sydney"];

  const { error } = await supabase
    .from('profiles')
    .update({
      currency: 'USD',
      starting_equity: 0,
      strategies: defaultStrategies,
      sessions: defaultSessions,
      asset_class: 'forex',
    })
    .eq('id', user.id);

  if (error) {
    console.error("Supabase Profile Reset Error:", error);
    return { error: error.message };
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath('/settings');

  return { success: true };
}

import { deleteUserCascade } from '@/utils/supabase/admin';

export async function deleteAccountAction() {
  const supabase = await createClient();

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to delete your account.' };
  }

  // Delete user and all dependent records across all tables
  const result = await deleteUserCascade(user.id);
  if (!result.success) {
    return { error: result.error || 'Failed to delete account. Please try again.' };
  }

  // Sign out
  await supabase.auth.signOut();

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath('/settings');

  return { success: true };
}

