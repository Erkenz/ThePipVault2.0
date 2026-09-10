'use server';

import { verifyAdminUser } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserRoleAction(targetUserId: string, newRole: string) {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  const validRoles = ['admin', 'mentor', 'student', 'user'];
  if (!validRoles.includes(newRole)) {
    return { error: 'Invalid role selected.' };
  }

  // Prevent demoting self if no other admins exist
  if (auth.user.id === targetUserId && newRole !== 'admin') {
    const { count } = await auth.adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if ((count || 0) <= 1) {
      return { error: 'You cannot remove your own admin role because you are the sole administrator.' };
    }
  }

  const { error } = await auth.adminClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (error) {
    return { error: `Failed to update user role: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function removeUserFromGroupAction(targetUserId: string) {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  const { error } = await auth.adminClient
    .from('profiles')
    .update({ group_id: null })
    .eq('id', targetUserId);

  if (error) {
    return { error: `Failed to disconnect user from group: ${error.message}` };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function deleteGroupAdminAction(groupId: string) {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    // 1. Unlink all profiles from this group
    await auth.adminClient
      .from('profiles')
      .update({ group_id: null })
      .eq('group_id', groupId);

    // 2. Fetch all homework ids for this group to clean submissions and homework
    const { data: homeworks } = await auth.adminClient
      .from('homework')
      .select('id')
      .eq('group_id', groupId);

    if (homeworks && homeworks.length > 0) {
      const hwIds = homeworks.map((h) => h.id);
      await auth.adminClient
        .from('homework_submissions')
        .delete()
        .in('homework_id', hwIds);

      await auth.adminClient
        .from('homework')
        .delete()
        .eq('group_id', groupId);
    }

    // 3. Delete the group itself
    const { error: groupError } = await auth.adminClient
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (groupError) {
      return { error: `Failed to delete group: ${groupError.message}` };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: `An unexpected error occurred: ${err?.message || 'Unknown error'}` };
  }
}

export interface ModerationParams {
  type: 'homework' | 'submission' | 'trade_comment' | 'trade';
  id: string;
}

export async function deleteInappropriateContentAction({ type, id }: ModerationParams) {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    if (type === 'submission') {
      const { error } = await auth.adminClient
        .from('homework_submissions')
        .delete()
        .eq('id', id);

      if (error) return { error: error.message };
    } else if (type === 'homework') {
      await auth.adminClient
        .from('homework_submissions')
        .delete()
        .eq('homework_id', id);

      const { error } = await auth.adminClient
        .from('homework')
        .delete()
        .eq('id', id);

      if (error) return { error: error.message };
    } else if (type === 'trade_comment') {
      const { error } = await auth.adminClient
        .from('trades')
        .update({ trade_comment: null })
        .eq('id', id);

      if (error) return { error: error.message };
    } else if (type === 'trade') {
      const { error } = await auth.adminClient
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/journal');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: `Content moderation failed: ${err?.message || 'Unknown error'}` };
  }
}

export async function deleteUserAccountAdminAction(targetUserId: string) {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  if (targetUserId === auth.user.id) {
    return { error: 'You cannot delete your own admin account from this panel.' };
  }

  try {
    // 1. Wipe user trades
    await auth.adminClient.from('trades').delete().eq('user_id', targetUserId);

    // 2. Wipe user submissions
    await auth.adminClient.from('homework_submissions').delete().eq('student_id', targetUserId);

    // 3. Wipe user notifications
    try {
      await auth.adminClient.from('notifications').delete().eq('user_id', targetUserId);
    } catch {
      // ignore if table doesn't exist
    }

    // 4. Wipe user accounts
    await auth.adminClient.from('accounts').delete().eq('user_id', targetUserId);

    // 5. Delete profile
    await auth.adminClient.from('profiles').delete().eq('id', targetUserId);

    // 6. Delete auth user
    const { error: authDeleteError } = await auth.adminClient.auth.admin.deleteUser(targetUserId);
    if (authDeleteError) {
      return { error: `Failed to remove auth account: ${authDeleteError.message}` };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: `Failed to delete user: ${err?.message || 'Unknown error'}` };
  }
}
