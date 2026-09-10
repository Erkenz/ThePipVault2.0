'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Optioneel: Stuur de gebruiker naar een 'verifieer je email' pagina, 
  // maar voor nu sturen we ze direct door (mits email confirmatie in Supabase uitstaat).
  redirect('/dashboard');
}