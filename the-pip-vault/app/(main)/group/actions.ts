'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to generate a clean, readable alphanumeric invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface CreateGroupInput {
  name: string;
  description: string;
  logo_url?: string;
}

export async function createGroupAction(input: CreateGroupInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn om een groep aan te maken.' };
  }

  if (!input.name?.trim()) {
    return { error: 'Groepsnaam is verplicht.' };
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (!existing) {
      isUnique = true;
    } else {
      inviteCode = generateInviteCode();
      attempts++;
    }
  }

  const basePayload = {
    name: input.name.trim(),
    mentor_id: user.id,
    owner_id: user.id,
    invite_code: inviteCode,
    logo_url: input.logo_url?.trim() || null,
    settings: {
      description: input.description?.trim() || '',
      show_rr: true,
      show_setup: true,
      show_psychology: true,
    },
  };

  let insertedGroup = null;

  // Try inserting with 'description' column first (if migration was run)
  const { data: withDesc, error: descErr } = await supabase
    .from('groups')
    .insert({
      ...basePayload,
      description: input.description?.trim() || null,
    })
    .select()
    .single();

  if (!descErr && withDesc) {
    insertedGroup = withDesc;
  } else {
    // Fallback if 'description' column does not exist yet
    const { data: withoutDesc, error: fallbackErr } = await supabase
      .from('groups')
      .insert(basePayload)
      .select()
      .single();

    if (fallbackErr) {
      console.error('Create Group Error:', fallbackErr);
      return { error: `Fout bij aanmaken van de groep: ${fallbackErr.message}` };
    }
    insertedGroup = withoutDesc;
  }

  // Update creator's profile: assign group_id and ensure role is 'mentor' if not admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const newRole = profile?.role === 'admin' ? 'admin' : 'mentor';

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      group_id: insertedGroup.id,
      role: newRole,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating user profile with group_id:', profileError);
  }

  revalidatePath('/group');
  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return { success: true, group: insertedGroup };
}

export async function joinGroupAction(inviteCode: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn om lid te worden van een groep.' };
  }

  const cleanCode = inviteCode?.trim().toUpperCase();
  if (!cleanCode) {
    return { error: 'Voer een geldige uitnodigingscode in.' };
  }

  // Search for group by invite code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .ilike('invite_code', cleanCode)
    .maybeSingle();

  if (groupError || !group) {
    return { error: 'Geen groep gevonden met deze uitnodigingscode. Controleer de code en probeer het opnieuw.' };
  }

  // Check current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.group_id === group.id) {
    return { error: 'Je bent al lid van deze groep.' };
  }

  // Update profile with new group_id
  const updatePayload: { group_id: string; role?: string } = {
    group_id: group.id,
  };

  // If regular user or undefined role, set to student
  if (!profile?.role || profile.role === 'user') {
    updatePayload.role = 'student';
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id);

  if (updateError) {
    console.error('Error joining group:', updateError);
    return { error: `Fout bij aansluiten bij groep: ${updateError.message}` };
  }

  revalidatePath('/group');
  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return { success: true, groupName: group.name };
}

export async function leaveGroupAction() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ group_id: null })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/group');
  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return { success: true };
}

export async function removeMemberAction(memberId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn.' };
  }

  // Verify that the current user is mentor/owner of the member's group
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('group_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!currentProfile?.group_id) {
    return { error: 'Geen actieve groep gevonden.' };
  }

  const { data: group } = await supabase
    .from('groups')
    .select('mentor_id, owner_id')
    .eq('id', currentProfile.group_id)
    .maybeSingle();

  const isAuthorized = group?.mentor_id === user.id || group?.owner_id === user.id || currentProfile.role === 'admin';
  if (!isAuthorized) {
    return { error: 'Je hebt geen rechten om leden te verwijderen uit deze groep.' };
  }

  // Remove member by setting their group_id to null
  const { error } = await supabase
    .from('profiles')
    .update({ group_id: null })
    .eq('id', memberId)
    .eq('group_id', currentProfile.group_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/group');
  return { success: true };
}

export async function regenerateInviteCodeAction(groupId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn.' };
  }

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();

  if (!group || (group.mentor_id !== user.id && group.owner_id !== user.id)) {
    return { error: 'Alleen de mentor kan een nieuwe uitnodigingscode genereren.' };
  }

  const newCode = generateInviteCode();
  const { error } = await supabase
    .from('groups')
    .update({ invite_code: newCode })
    .eq('id', groupId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/group');
  return { success: true, newCode };
}

export interface CreateHomeworkInput {
  groupId: string;
  title: string;
  description: string;
  guidelines: string;
  due_date: string;
  chart_url?: string;
  student_id?: string | null;
}

export async function createHomeworkAction(input: CreateHomeworkInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn om opdrachten aan te maken.' };
  }

  if (!input.title?.trim()) {
    return { error: 'Titel van de opdracht is verplicht.' };
  }
  if (!input.description?.trim()) {
    return { error: 'Beschrijving van de opdracht is verplicht.' };
  }
  if (!input.due_date) {
    return { error: 'Deadline is verplicht.' };
  }

  // Format combined description with Richtlijnen so it is guaranteed visible everywhere
  const combinedDescription = input.guidelines?.trim()
    ? `${input.description.trim()}\n\n---\n**Richtlijnen:**\n${input.guidelines.trim()}`
    : input.description.trim();

  const baseHomework = {
    group_id: input.groupId,
    student_id: input.student_id || null,
    title: input.title.trim(),
    description: combinedDescription,
    chart_url: input.chart_url?.trim() || null,
    due_date: new Date(input.due_date).toISOString(),
  };

  let newHomework = null;

  // Try insert with guidelines column first
  const { data: withGuide, error: guideErr } = await supabase
    .from('homework')
    .insert({
      ...baseHomework,
      guidelines: input.guidelines?.trim() || null,
    })
    .select()
    .single();

  if (!guideErr && withGuide) {
    newHomework = withGuide;
  } else {
    // Fallback without guidelines column
    const { data: withoutGuide, error: fallbackErr } = await supabase
      .from('homework')
      .insert(baseHomework)
      .select()
      .single();

    if (fallbackErr) {
      console.error('Homework create error:', fallbackErr);
      return { error: `Fout bij opslaan van opdracht: ${fallbackErr.message}` };
    }
    newHomework = withoutGuide;
  }

  // Notify students in the group
  try {
    const studentQuery = supabase
      .from('profiles')
      .select('id')
      .eq('group_id', input.groupId)
      .neq('id', user.id);

    if (input.student_id) {
      studentQuery.eq('id', input.student_id);
    }

    const { data: students } = await studentQuery;

    if (students && students.length > 0) {
      const notifications = students.map(s => ({
        user_id: s.id,
        type: 'homework_assigned',
        title: `Nieuwe opdracht: ${input.title.trim()}`,
        message: `Er staat een nieuwe opdracht klaar. Deadline: ${new Date(input.due_date).toLocaleDateString('nl-NL')}.`,
        link: '/group',
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    }
  } catch (notifErr) {
    // Gracefully ignore if notifications table is not created yet
    console.warn('Notification dispatch caught error (schema might not have table):', notifErr);
  }

  revalidatePath('/group');
  return { success: true, homework: newHomework };
}

export async function submitHomeworkAction(homeworkId: string, content: string, chartUrl?: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn om een opdracht in te leveren.' };
  }

  if (!content?.trim()) {
    return { error: 'Beschrijving of uitwerking is verplicht.' };
  }

  const { data, error } = await supabase
    .from('homework_submissions')
    .insert({
      homework_id: homeworkId,
      student_id: user.id,
      content: content.trim(),
      chart_url: chartUrl?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Homework submission error:', error);
    return { error: `Fout bij inleveren: ${error.message}` };
  }

  revalidatePath('/group');
  return { success: true, submission: data };
}

export async function gradeSubmissionAction(submissionId: string, grade: string, feedback: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Je moet ingelogd zijn.' };
  }

  const { error } = await supabase
    .from('homework_submissions')
    .update({
      grade: grade?.trim() || null,
      feedback: feedback?.trim() || null,
    })
    .eq('id', submissionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/group');
  return { success: true };
}
