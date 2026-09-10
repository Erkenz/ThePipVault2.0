import { createClient } from '@/utils/supabase/server';
import { getAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';
import { Group, Profile } from '@/types/database';

export interface AdminUserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  group_id: string | null;
  group_name?: string | null;
  starting_equity: number;
  currency: string;
  created_at?: string;
  last_sign_in_at?: string;
  trades_count?: number;
}

export interface AdminGroupItem extends Group {
  member_count: number;
  mentor_name?: string;
  mentor_email?: string;
  homework_count: number;
}

export interface ModerationItem {
  id: string;
  type: 'submission' | 'homework' | 'trade_comment';
  title?: string;
  author_name: string;
  author_email?: string;
  content: string;
  chart_url?: string | null;
  created_at: string;
  group_name?: string;
}

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Verify that current user has admin role
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!currentProfile || currentProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  const adminClient = getAdminClient();

  // 2. Fetch all profiles & auth users
  const [
    { data: profilesData },
    { data: authUsersData },
    { data: groupsData },
    { data: tradesData, count: totalTradesCount },
    { data: homeworkData, count: totalHomeworkCount },
    { data: submissionsData, count: totalSubmissionsCount }
  ] = await Promise.all([
    adminClient.from('profiles').select('*').order('first_name', { ascending: true }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    adminClient.from('groups').select('*').order('created_at', { ascending: false }),
    adminClient.from('trades').select('id, user_id, trade_comment, pair, date, created_at, pnl', { count: 'exact' }).order('date', { ascending: false }).limit(100),
    adminClient.from('homework').select('id, group_id, title, description, guidelines, chart_url, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
    adminClient.from('homework_submissions').select('id, homework_id, student_id, content, chart_url, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(50)
  ]);

  const profiles = (profilesData || []) as Profile[];
  const authUsers = authUsersData?.users || [];
  const groups = (groupsData || []) as Group[];

  // Build lookup maps
  const authMap = new Map<string, { email: string; created_at: string; last_sign_in_at?: string }>();
  for (const u of authUsers) {
    authMap.set(u.id, {
      email: u.email || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    });
  }

  const groupMap = new Map<string, string>();
  for (const g of groups) {
    groupMap.set(g.id, g.name);
  }

  const profileMap = new Map<string, Profile>();
  for (const p of profiles) {
    profileMap.set(p.id, p);
  }

  // Count trades per user
  const userTradesCount = new Map<string, number>();
  if (tradesData) {
    for (const t of tradesData) {
      userTradesCount.set(t.user_id, (userTradesCount.get(t.user_id) || 0) + 1);
    }
  }

  // Build users list for admin
  const userList: AdminUserItem[] = profiles.map((p) => {
    const authInfo = authMap.get(p.id);
    return {
      id: p.id,
      email: authInfo?.email || p.email || 'No email found',
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      role: p.role || 'user',
      group_id: p.group_id,
      group_name: p.group_id ? groupMap.get(p.group_id) || 'Unknown Group' : null,
      starting_equity: Number(p.starting_equity) || 0,
      currency: p.currency || 'USD',
      created_at: authInfo?.created_at,
      last_sign_in_at: authInfo?.last_sign_in_at,
      trades_count: userTradesCount.get(p.id) || 0,
    };
  });

  // Count members per group
  const groupMemberCount = new Map<string, number>();
  for (const p of profiles) {
    if (p.group_id) {
      groupMemberCount.set(p.group_id, (groupMemberCount.get(p.group_id) || 0) + 1);
    }
  }

  // Count homework per group
  const groupHomeworkCount = new Map<string, number>();
  if (homeworkData) {
    for (const h of homeworkData) {
      if (h.group_id) {
        groupHomeworkCount.set(h.group_id, (groupHomeworkCount.get(h.group_id) || 0) + 1);
      }
    }
  }

  // Build groups list for admin
  const groupList: AdminGroupItem[] = groups.map((g) => {
    const mentorProfile = profileMap.get(g.mentor_id);
    const mentorAuth = authMap.get(g.mentor_id);
    const mentorName = mentorProfile
      ? `${mentorProfile.first_name || ''} ${mentorProfile.last_name || ''}`.trim() || 'Mentor'
      : 'Unknown';

    return {
      ...g,
      member_count: groupMemberCount.get(g.id) || 0,
      mentor_name: mentorName,
      mentor_email: mentorAuth?.email || '',
      homework_count: groupHomeworkCount.get(g.id) || 0,
    };
  });

  // Build moderation feed
  const moderationItems: ModerationItem[] = [];

  // 1. Submissions with content
  if (submissionsData) {
    for (const sub of submissionsData) {
      const studentProfile = profileMap.get(sub.student_id);
      const studentAuth = authMap.get(sub.student_id);
      moderationItems.push({
        id: sub.id,
        type: 'submission',
        title: 'Homework Submission',
        author_name: studentProfile ? `${studentProfile.first_name || ''} ${studentProfile.last_name || ''}`.trim() || 'Student' : 'Student',
        author_email: studentAuth?.email,
        content: sub.content || '(No text content)',
        chart_url: sub.chart_url,
        created_at: sub.created_at,
      });
    }
  }

  // 2. Homework assignments
  if (homeworkData) {
    for (const hw of homeworkData) {
      moderationItems.push({
        id: hw.id,
        type: 'homework',
        title: `Assignment: ${hw.title}`,
        author_name: 'Mentor / Admin',
        content: hw.description || '(No description provided)',
        chart_url: hw.chart_url,
        created_at: hw.created_at,
        group_name: hw.group_id ? groupMap.get(hw.group_id) : undefined,
      });
    }
  }

  // 3. Trade comments with actual remarks
  if (tradesData) {
    for (const tr of tradesData) {
      if (tr.trade_comment && tr.trade_comment.trim().length > 0) {
        const traderProfile = profileMap.get(tr.user_id);
        const traderAuth = authMap.get(tr.user_id);
        moderationItems.push({
          id: tr.id,
          type: 'trade_comment',
          title: `Trade Note (${tr.pair || 'Trade'})`,
          author_name: traderProfile ? `${traderProfile.first_name || ''} ${traderProfile.last_name || ''}`.trim() || 'Trader' : 'Trader',
          author_email: traderAuth?.email,
          content: tr.trade_comment,
          created_at: tr.created_at || tr.date,
        });
      }
    }
  }

  // Sort moderation feed descending by date
  moderationItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const platformStats = {
    totalUsers: profiles.length,
    adminsCount: profiles.filter((p) => p.role === 'admin').length,
    mentorsCount: profiles.filter((p) => p.role === 'mentor').length,
    studentsCount: profiles.filter((p) => p.role === 'student').length,
    regularUsersCount: profiles.filter((p) => !p.role || p.role === 'user').length,
    totalGroups: groups.length,
    totalTrades: totalTradesCount || (tradesData?.length || 0),
    totalHomework: totalHomeworkCount || (homeworkData?.length || 0),
    totalSubmissions: totalSubmissionsCount || (submissionsData?.length || 0),
  };

  return (
    <AdminClient
      currentUser={{
        id: user.id,
        email: user.email || '',
      }}
      initialUsers={userList}
      initialGroups={groupList}
      initialModerationItems={moderationItems}
      stats={platformStats}
    />
  );
}
