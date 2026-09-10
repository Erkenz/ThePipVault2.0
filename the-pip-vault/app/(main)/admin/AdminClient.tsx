'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Layers,
  BarChart3,
  BookOpen,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  FileText,
  Activity,
  CheckCircle2,
  X,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Shield,
  KeyRound,
  Calendar,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminUserItem, AdminGroupItem, ModerationItem } from './page';
import {
  updateUserRoleAction,
  removeUserFromGroupAction,
  deleteGroupAdminAction,
  deleteInappropriateContentAction,
  deleteUserAccountAdminAction,
} from './actions';

interface AdminClientProps {
  currentUser: {
    id: string;
    email: string;
  };
  initialUsers: AdminUserItem[];
  initialGroups: AdminGroupItem[];
  initialModerationItems: ModerationItem[];
  stats: {
    totalUsers: number;
    adminsCount: number;
    mentorsCount: number;
    studentsCount: number;
    regularUsersCount: number;
    totalGroups: number;
    totalTrades: number;
    totalHomework: number;
    totalSubmissions: number;
  };
}

export default function AdminClient({
  currentUser,
  initialUsers,
  initialGroups,
  initialModerationItems,
  stats,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'groups' | 'moderation'>('overview');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [groupSearch, setGroupSearch] = useState('');
  const [modFilter, setModFilter] = useState<'all' | 'submission' | 'homework' | 'trade_comment'>('all');

  // Modal States
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserItem | null>(null);
  const [newRoleInput, setNewRoleInput] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [selectedGroupForDelete, setSelectedGroupForDelete] = useState<AdminGroupItem | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const [selectedModItemForDelete, setSelectedModItemForDelete] = useState<ModerationItem | null>(null);
  const [isDeletingModItem, setIsDeletingModItem] = useState(false);

  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Data refreshed successfully');
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Invite code ${text} copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // -------------------------------------------------------------
  // ACTIONS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateRole = async () => {
    if (!selectedUserForRole || !newRoleInput) return;
    setIsUpdatingRole(true);
    try {
      const res = await updateUserRoleAction(selectedUserForRole.id, newRoleInput);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Role for ${selectedUserForRole.first_name || selectedUserForRole.email} updated to '${newRoleInput}'`);
        setSelectedUserForRole(null);
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred while updating the role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveFromGroup = async (user: AdminUserItem) => {
    if (!confirm(`Are you sure you want to disconnect ${user.first_name || user.email} from their group?`)) {
      return;
    }

    try {
      const res = await removeUserFromGroupAction(user.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`User successfully removed from group.`);
        router.refresh();
      }
    } catch {
      toast.error('Failed to remove user from group.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupForDelete) return;
    setIsDeletingGroup(true);
    try {
      const res = await deleteGroupAdminAction(selectedGroupForDelete.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Group "${selectedGroupForDelete.name}" and associated assignments deleted.`);
        setSelectedGroupForDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Failed to delete group.');
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const handleDeleteModItem = async () => {
    if (!selectedModItemForDelete) return;
    setIsDeletingModItem(true);
    try {
      const res = await deleteInappropriateContentAction({
        type: selectedModItemForDelete.type,
        id: selectedModItemForDelete.id,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Inappropriate content removed successfully.');
        setSelectedModItemForDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Failed to remove content.');
    } finally {
      setIsDeletingModItem(false);
    }
  };

  const handleDeleteUserAccount = async () => {
    if (!selectedUserForDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await deleteUserAccountAdminAction(selectedUserForDelete.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Account for ${selectedUserForDelete.email} has been permanently deleted.`);
        setSelectedUserForDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Failed to delete user account.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERED DATA
  // -------------------------------------------------------------
  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredGroups = initialGroups.filter((g) => {
    return (
      g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.invite_code.toLowerCase().includes(groupSearch.toLowerCase()) ||
      (g.mentor_name && g.mentor_name.toLowerCase().includes(groupSearch.toLowerCase()))
    );
  });

  const filteredModItems = initialModerationItems.filter((item) => {
    if (modFilter === 'all') return true;
    return item.type === modFilter;
  });

  // Helper for role badges in clean SaaS style
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 border border-purple-200 text-purple-700">
            Admin
          </span>
        );
      case 'mentor':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
            Mentor
          </span>
        );
      case 'student':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-700">
            Student
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
            User
          </span>
        );
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-700">
              Platform Oversight
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Global platform monitoring, user roles, group oversight, and content moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform Operational</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors cursor-pointer"
            title="Refresh platform data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-sm w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users size={14} />
          <span>Users & Roles ({initialUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'groups'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers size={14} />
          <span>Groups Oversight ({initialGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'moderation'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Content Moderation ({initialModerationItems.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & MONITORING */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Registered Users
                  </h3>
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalUsers}</div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {stats.adminsCount} Admin{stats.adminsCount !== 1 ? 's' : ''}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stats.mentorsCount} Mentor{stats.mentorsCount !== 1 ? 's' : ''}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {stats.studentsCount} Student{stats.studentsCount !== 1 ? 's' : ''}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {stats.regularUsersCount} User{stats.regularUsersCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Total Groups */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Platform Groups
                  </h3>
                  <Layers size={16} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalGroups}</div>
              </div>
              <div className="text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
                {initialGroups.reduce((acc, g) => acc + g.member_count, 0)} total assigned members
              </div>
            </div>

            {/* Total Trades */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Logged Trades
                  </h3>
                  <TrendingUp size={16} className="text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalTrades}</div>
              </div>
              <div className="text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
                Logged across all user accounts & journals
              </div>
            </div>

            {/* Total Submissions & Assignments */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Homework Submissions
                  </h3>
                  <BookOpen size={16} className="text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalSubmissions}</div>
              </div>
              <div className="text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
                Across {stats.totalHomework} mentor assignments
              </div>
            </div>
          </div>

          {/* Middle Row: Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  User Composition
                </h3>
                <div className="text-lg font-bold text-slate-900">Role Distribution</div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Admins</span>
                    <span className="font-bold text-slate-900">{stats.adminsCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${(stats.adminsCount / (stats.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Mentors</span>
                    <span className="font-bold text-slate-900">{stats.mentorsCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${(stats.mentorsCount / (stats.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Students</span>
                    <span className="font-bold text-slate-900">{stats.studentsCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(stats.studentsCount / (stats.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Standard Users</span>
                    <span className="font-bold text-slate-900">{stats.regularUsersCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${(stats.regularUsersCount / (stats.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                Active administrator: <span className="font-semibold text-slate-800">{currentUser.email}</span>
              </div>
            </div>

            {/* Live Feed Card */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Activity & Moderation Queue
                  </h3>
                  <div className="text-lg font-bold text-slate-900">Recent User Content</div>
                </div>

                <button
                  onClick={() => setActiveTab('moderation')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View Full Queue</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {initialModerationItems.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="p-3.5 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.type === 'submission'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.type === 'homework'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.type === 'submission'
                            ? 'Submission'
                            : item.type === 'homework'
                            ? 'Assignment'
                            : 'Trade Note'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.author_name}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        "{item.content}"
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedModItemForDelete(item)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-700 text-xs font-medium shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                      title="Moderate / Delete"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                ))}

                {initialModerationItems.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No user content in moderation queue.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: USERS & ROLES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-md shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                Filter:
              </span>
              {['all', 'admin', 'mentor', 'student', 'user'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          {/* User Data Table */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Group Assignment</th>
                    <th className="px-5 py-3.5">Starting Capital</th>
                    <th className="px-5 py-3.5">Trades Logged</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-xs">
                              {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span>{displayName}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 border border-purple-200 text-purple-700 uppercase tracking-wide">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {user.group_id ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                                {user.group_name || 'Assigned'}
                              </span>
                              <button
                                onClick={() => handleRemoveFromGroup(user)}
                                className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                title="Disconnect user from this group"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">No Group</span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-800 font-medium">
                          {user.starting_equity ? `${user.currency} ${user.starting_equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-700">
                          {user.trades_count || 0} trades
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUserForRole(user);
                                setNewRoleInput(user.role);
                              }}
                              className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <UserCheck size={13} />
                              <span>Change Role</span>
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => setSelectedUserForDelete(user)}
                                className="p-1.5 rounded bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 shadow-xs transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400 font-medium">
                        No users match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: GROUPS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-md shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Search group name, code or mentor..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition-all"
              />
            </div>

            <div className="text-xs font-medium text-slate-500">
              Total: <span className="font-bold text-slate-900">{filteredGroups.length}</span> groups on platform
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{group.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {group.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-800 shrink-0">
                      <span>{group.invite_code}</span>
                      <button
                        onClick={() => copyToClipboard(group.invite_code)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy invite code"
                      >
                        {copiedCode === group.invite_code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Group Metrics Details */}
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mentor:</span>
                      <span className="text-slate-900 font-semibold">{group.mentor_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Members:</span>
                      <span className="text-slate-900 font-bold">{group.member_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Homework Tasks:</span>
                      <span className="text-slate-900 font-bold">{group.homework_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created At:</span>
                      <span className="text-slate-600 font-mono">
                        {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Group Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {group.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => setSelectedGroupForDelete(group)}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Group</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-400 text-xs font-medium bg-white rounded-md border border-slate-200">
                No groups found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CONTENT MODERATION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {/* Moderation Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-md shadow-sm">
            <div className="text-xs font-medium text-slate-600">
              Audit and moderate student homework submissions, mentor tasks, and user comments.
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'submission', 'homework', 'trade_comment'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setModFilter(filter)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    modFilter === filter
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
                  }`}
                >
                  {filter === 'all'
                    ? 'All Content'
                    : filter === 'submission'
                    ? 'Submissions'
                    : filter === 'homework'
                    ? 'Assignments'
                    : 'Trade Notes'}
                </button>
              ))}
            </div>
          </div>

          {/* Moderation Items */}
          <div className="space-y-4">
            {filteredModItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'submission'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.type === 'homework'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {item.type === 'submission'
                        ? 'Homework Submission'
                        : item.type === 'homework'
                        ? 'Assignment'
                        : 'Trade Note'}
                    </span>
                    {item.title && <span className="font-bold text-slate-900 text-xs">{item.title}</span>}
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-700 font-semibold">{item.author_name}</span>
                    {item.author_email && (
                      <span className="text-xs text-slate-400 font-mono">({item.author_email})</span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>

                  {item.chart_url && (
                    <div className="pt-1">
                      <a
                        href={item.chart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <ExternalLink size={13} />
                        <span>View Attached Chart / Graphic</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedModItemForDelete(item)}
                    className="w-full md:w-auto px-4 py-2 rounded-md bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete Content</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredModItems.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-xs font-medium bg-white rounded-md border border-slate-200">
                No content items found for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPDATE USER ROLE */}
      {/* ------------------------------------------------------------- */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck size={18} className="text-purple-600" />
                <span>Change User Role</span>
              </h3>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                <div className="text-slate-500 font-medium">Selected User:</div>
                <div className="font-bold text-slate-900">
                  {selectedUserForRole.first_name || ''} {selectedUserForRole.last_name || ''}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">{selectedUserForRole.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select New Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Full platform management' },
                    { id: 'mentor', label: 'Mentor', desc: 'Lead groups & homework' },
                    { id: 'student', label: 'Student', desc: 'Group member' },
                    { id: 'user', label: 'User', desc: 'Standard trader' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setNewRoleInput(role.id)}
                      className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                        newRoleInput === role.id
                          ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs capitalize">{role.label}</div>
                      <div className="text-[10px] text-slate-500">{role.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedUserForRole.id === currentUser.id && newRoleInput !== 'admin' && (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Warning: You are attempting to demote yourself. If you are the only administrator, this action will be blocked.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForRole(null)}
                disabled={isUpdatingRole}
                className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={isUpdatingRole || !newRoleInput}
                className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isUpdatingRole ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE GROUP */}
      {/* ------------------------------------------------------------- */}
      {selectedGroupForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>Delete Group</span>
              </h3>
              <button
                onClick={() => setSelectedGroupForDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                Are you sure you want to delete group <span className="font-bold text-slate-900">"{selectedGroupForDelete.name}"</span>?
              </p>

              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 space-y-1">
                <div className="font-bold">What will happen:</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>All {selectedGroupForDelete.member_count} assigned members will be safely unlinked.</li>
                  <li>All homework tasks and submissions for this group will be cleaned up.</li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedGroupForDelete(null)}
                disabled={isDeletingGroup}
                className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isDeletingGroup ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE MODERATION CONTENT */}
      {/* ------------------------------------------------------------- */}
      {selectedModItemForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={18} />
                <span>Remove Inappropriate Content</span>
              </h3>
              <button
                onClick={() => setSelectedModItemForDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                You are about to moderate and permanently delete this user content:
              </p>

              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedModItemForDelete.type} by {selectedModItemForDelete.author_name}
                </div>
                <div className="text-slate-800 italic line-clamp-3">
                  "{selectedModItemForDelete.content}"
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedModItemForDelete(null)}
                disabled={isDeletingModItem}
                className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteModItem}
                disabled={isDeletingModItem}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isDeletingModItem ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE USER ACCOUNT */}
      {/* ------------------------------------------------------------- */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <UserX size={18} />
                <span>Delete User Account</span>
              </h3>
              <button
                onClick={() => setSelectedUserForDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                Are you sure you want to permanently delete the account of <span className="font-bold text-slate-900">{selectedUserForDelete.email}</span>?
              </p>

              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 space-y-1 text-[11px]">
                <div>This will purge all associated user data including trades, accounts, and profile info from the database.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserAccount}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isDeletingUser ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
