import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from './server';

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or SERVICE_KEY missing in environment.');
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Verifies that the current request is from an authenticated user with 'admin' role.
 * Returns the admin Supabase client and the user/profile if valid, or returns unauthorized error.
 */
export async function verifyAdminUser() {
  const serverClient = await createServerClient();
  const { data: { user }, error: authError } = await serverClient.auth.getUser();

  if (authError || !user) {
    return { authorized: false as const, error: 'You must be logged in to perform this action.' };
  }

  // Check role in profiles table
  const adminClient = getAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') {
    return { authorized: false as const, error: 'Access denied: Administrator role required.' };
  }

  return {
    authorized: true as const,
    user,
    profile,
    adminClient,
  };
}
