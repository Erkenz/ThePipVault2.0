'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AccountInput {
  name: string;
  type: string;
  start_amount: number;
  currency: string;
  status: string;
  is_default: boolean;
}

export async function addAccountAction(accountData: AccountInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to manage accounts.' };
  }

  // If this new account is set as default, clear default status of other accounts
  if (accountData.is_default) {
    await supabase
      .from('accounts')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { error } = await supabase.from('accounts').insert({
    ...accountData,
    user_id: user.id
  });

  if (error) {
    console.error("Supabase Add Account Error:", error);
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  return { success: true };
}

export async function updateAccountAction(accountId: string, accountData: AccountInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to manage accounts.' };
  }

  // If this account is marked as default, clear default status of other accounts
  if (accountData.is_default) {
    await supabase
      .from('accounts')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { error } = await supabase
    .from('accounts')
    .update(accountData)
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Supabase Update Account Error:", error);
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  return { success: true };
}

export async function deleteAccountAction(accountId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to manage accounts.' };
  }

  // Delete all trades linked to this account first to maintain database consistency
  const { error: tradesError } = await supabase
    .from('trades')
    .delete()
    .eq('account_id', accountId)
    .eq('user_id', user.id);

  if (tradesError) {
    console.error("Supabase linked trades deletion error:", tradesError.message);
  }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Supabase Delete Account Error:", error);
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath('/analytics');
  return { success: true };
}
