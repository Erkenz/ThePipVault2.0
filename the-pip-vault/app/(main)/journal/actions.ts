'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTradeAction(tradeData: any) {
  const supabase = await createClient();

  // Haal de huidige gebruiker op
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'You must be logged in to add a trade.' };
  }

  // Voeg de trade toe aan Supabase
  const { error } = await supabase.from('trades').insert({
    ...tradeData,
    user_id: user.id, // Koppel de trade aan de ingelogde gebruiker
  });

  if (error) {
    console.error("Supabase Insert Error:", error);
    return { error: error.message };
  }

  // Ververs de journal pagina cache zodat de nieuwe trade direct zichtbaar is
  revalidatePath('/journal');
  
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