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

import { createClient as createJSClient } from '@supabase/supabase-js';

export async function deleteAccountAction() {
  const supabase = await createClient();

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to delete your account.' };
  }

  // 1. Delete user's trades (manual wipe for extra safety)
  const { error: tradesDeleteError } = await supabase
    .from('trades')
    .delete()
    .eq('user_id', user.id);

  if (tradesDeleteError) {
    console.error("Supabase Trades Delete Error during account deletion:", tradesDeleteError);
    return { error: `Failed to delete trades: ${tradesDeleteError.message}` };
  }

  // 2. Delete user's profile
  const { error: profileDeleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileDeleteError) {
    console.error("Supabase Profile Delete Error during account deletion:", profileDeleteError);
    return { error: `Failed to delete profile: ${profileDeleteError.message}` };
  }

  // 3. Create admin client to delete auth user using SERVICE_KEY
  const adminClient = createJSClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_KEY!
  );

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (authDeleteError) {
    console.error("Supabase Auth Delete Error during account deletion:", authDeleteError);
    return { error: `Failed to delete account: ${authDeleteError.message}` };
  }

  // 4. Sign out
  await supabase.auth.signOut();

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath('/settings');

  return { success: true };
}
