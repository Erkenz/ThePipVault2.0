'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTradeAction(tradeData: any) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'You must be logged in to add a trade.' };
  }

  const { selectedAccountIds, ...restTradeData } = tradeData;

  if (selectedAccountIds && selectedAccountIds.length > 0) {
    // Fetch account details to populate name & type
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, name, type')
      .in('id', selectedAccountIds)
      .eq('user_id', user.id);

    const insertions = selectedAccountIds.map((accountId: string) => {
      const account = accounts?.find(a => a.id === accountId);
      return {
        ...restTradeData,
        account_id: accountId,
        account_type: account ? `${account.name} (${account.type})` : restTradeData.account_type,
        user_id: user.id,
      };
    });

    const { error } = await supabase.from('trades').insert(insertions);
    if (error) {
      console.error("Supabase Batch Insert Error:", error);
      return { error: error.message };
    }
  } else {
    // Single trade fallback insert
    const { error } = await supabase.from('trades').insert({
      ...tradeData,
      user_id: user.id,
    });
    if (error) {
      console.error("Supabase Insert Error:", error);
      return { error: error.message };
    }
  }

  // Ververs de cache zodat de nieuwe trades direct zichtbaar zijn
  revalidatePath('/journal');
  revalidatePath('/dashboard');
  revalidatePath('/analytics');
  
  return { success: true };
}
export async function updateTradeAction(tradeId: string, tradeData: any) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized request.' };

  const { error } = await supabase
    .from('trades')
    .update(tradeData)
    .eq('id', tradeId)
    .eq('user_id', user.id); // Extra beveiliging: alleen eigen trades updaten

  if (error) {
    console.error("Supabase Update Error:", error);
    return { error: error.message };
  }

  revalidatePath('/journal');
  return { success: true };
}

export async function deleteTradeAction(tradeId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized request.' };

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId)
    .eq('user_id', user.id); // Extra beveiliging

  if (error) {
    console.error("Supabase Delete Error:", error);
    return { error: error.message };
  }

  revalidatePath('/journal');
  return { success: true };
}