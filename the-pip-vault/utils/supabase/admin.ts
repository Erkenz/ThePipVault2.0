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

/**
 * Completely removes a user and all their associated constraints/data across all tables.
 * Cleans up in strict foreign-key dependency order so no constraint errors occur.
 */
export async function deleteUserCascade(userId: string): Promise<{ success: boolean; error?: string }> {
  const adminClient = getAdminClient();

  try {
    // 1. Handle groups where user is mentor or owner
    const { data: ownedGroups, error: fetchGroupsErr } = await adminClient
      .from('groups')
      .select('id')
      .or(`mentor_id.eq.${userId},owner_id.eq.${userId}`);

    if (!fetchGroupsErr && ownedGroups && ownedGroups.length > 0) {
      const groupIds = ownedGroups.map((g) => g.id);

      // Unlink all member profiles from these groups
      await adminClient
        .from('profiles')
        .update({ group_id: null })
        .in('group_id', groupIds);

      // Fetch homework in these groups to remove submissions first
      const { data: groupHw } = await adminClient
        .from('homework')
        .select('id')
        .in('group_id', groupIds);

      if (groupHw && groupHw.length > 0) {
        const hwIds = groupHw.map((h) => h.id);
        await adminClient
          .from('homework_submissions')
          .delete()
          .in('homework_id', hwIds);
      }

      // Delete homework in these groups
      await adminClient
        .from('homework')
        .delete()
        .in('group_id', groupIds);

      // Delete the groups themselves
      await adminClient
        .from('groups')
        .delete()
        .in('id', groupIds);
    }

    // 2. Unlink user profile from any other group
    await adminClient
      .from('profiles')
      .update({ group_id: null })
      .eq('id', userId);

    // 3. Delete or unlink any homework assigned to this student
    try {
      await adminClient
        .from('homework')
        .delete()
        .eq('student_id', userId);
    } catch {
      // ignore
    }

    // 4. Delete homework submissions created by this user
    await adminClient
      .from('homework_submissions')
      .delete()
      .eq('student_id', userId);

    // 5. Delete notifications (if table exists)
    try {
      await adminClient
        .from('notifications')
        .delete()
        .eq('user_id', userId);
    } catch {
      // ignore if table doesn't exist
    }

    // 6. Delete trades
    const { error: tradesErr } = await adminClient
      .from('trades')
      .delete()
      .eq('user_id', userId);

    if (tradesErr) {
      return { success: false, error: `Failed to remove user trades: ${tradesErr.message}` };
    }

    // 7. Delete accounts
    const { error: accountsErr } = await adminClient
      .from('accounts')
      .delete()
      .eq('user_id', userId);

    if (accountsErr) {
      return { success: false, error: `Failed to remove user accounts: ${accountsErr.message}` };
    }

    // 8. Delete profile
    const { error: profileErr } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) {
      return { success: false, error: `Failed to remove user profile: ${profileErr.message}` };
    }

    // 9. Delete auth user
    const { error: authErr } = await adminClient.auth.admin.deleteUser(userId);
    if (authErr) {
      return { success: false, error: `Failed to remove authentication record: ${authErr.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred during user deletion.' };
  }
}

