'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Basis validatie
  if (!email || !password) {
    redirect('/login?error=Vul alle velden in');
  }

  const supabase = await createClient();

  // Probeer in te loggen via Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Als het mislukt, stuur terug naar de login pagina met een foutmelding in de URL
  if (error) {
    redirect('/login?error=Verkeerd e-mailadres of wachtwoord');
  }

  // Als we hier komen is de login gelukt! De cookie wordt automatisch gezet
  // door onze createClient() helper. We sturen de gebruiker naar binnen.
  redirect('/dashboard');
}