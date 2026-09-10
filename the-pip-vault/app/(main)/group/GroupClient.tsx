'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  Send, 
  Award, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Group, Profile, Homework, HomeworkSubmission, Notification } from '@/types/database';
import { 
  createGroupAction, 
  joinGroupAction, 
  leaveGroupAction, 
  removeMemberAction, 
  regenerateInviteCodeAction, 
  createHomeworkAction, 
  submitHomeworkAction, 
  gradeSubmissionAction 
} from './actions';

interface GroupClientProps {
  currentUser: {
    id: string;
    email: string;
    profile: Profile | null;
  };
  group: Group | null;
  members: Profile[];
  homeworkList: Homework[];
  submissions: HomeworkSubmission[];
  notifications: Notification[];
  initialJoinCode?: string;
}

export default function GroupClient({
  currentUser,
  group,
  members,
  homeworkList,
  submissions,
  notifications,
  initialJoinCode = '',
}: GroupClientProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'members' | 'homework'>('members');
  const [now] = useState(() => Date.now());
  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // Modal States
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedHomeworkForSubmission, setSelectedHomeworkForSubmission] = useState<Homework | null>(null);
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<HomeworkSubmission | null>(null);

  // Form States - Join Group
  const [joinCodeInput, setJoinCodeInput] = useState(initialJoinCode);
  const [isJoining, setIsJoining] = useState(false);

  // Form States - Create Group
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupLogoUrl, setGroupLogoUrl] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Form States - Create Homework
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwGuidelines, setHwGuidelines] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwChartUrl, setHwChartUrl] = useState('');
  const [isCreatingHomework, setIsCreatingHomework] = useState(false);

  // Form States - Submit Homework
  const [subContent, setSubContent] = useState('');
  const [subChartUrl, setSubChartUrl] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);

  // Form States - Grade Submission
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // Copy States
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);

  // Check roles
  const isMentor = group?.mentor_id === currentUser.id || group?.owner_id === currentUser.id || currentUser.profile?.role === 'admin' || currentUser.profile?.role === 'mentor';
  const mySubmissions = submissions.filter((s) => s.student_id === currentUser.id);

  // Copy helper
  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
      toast.success('Uitnodigingscode gekopieerd naar klembord!');
    } else {
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 2000);
      toast.success('Uitnodigingslink gekopieerd naar klembord!');
    }
  };

  // Join Group Handler
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      toast.error('Vul een geldige uitnodigingscode in.');
      return;
    }

    setIsJoining(true);
    try {
      const res = await joinGroupAction(joinCodeInput.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Succesvol aangesloten bij groep "${res.groupName}"!`);
        setJoinCodeInput('');
      }
    } catch {
      toast.error('Er is een onverwachte fout opgetreden.');
    } finally {
      setIsJoining(false);
    }
  };

  // Create Group Handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Groepsnaam is verplicht.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      const res = await createGroupAction({
        name: groupName,
        description: groupDescription,
        logo_url: groupLogoUrl,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Groep "${groupName}" succesvol aangemaakt!`);
        setIsCreateGroupOpen(false);
        setGroupName('');
        setGroupDescription('');
        setGroupLogoUrl('');
      }
    } catch {
      toast.error('Er is een fout opgetreden bij het aanmaken van de groep.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Leave Group Handler
  const handleLeaveGroup = async () => {
    if (!confirm('Weet je zeker dat je deze groep wilt verlaten?')) return;
    try {
      const res = await leaveGroupAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Je hebt de groep verlaten.');
      }
    } catch {
      toast.error('Er is een fout opgetreden.');
    }
  };

  // Remove Member Handler
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Weet je zeker dat je ${memberName} wilt verwijderen uit de groep?`)) return;
    try {
      const res = await removeMemberAction(memberId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${memberName} is verwijderd uit de groep.`);
      }
    } catch {
      toast.error('Fout bij het verwijderen van lid.');
    }
  };

  // Regenerate Code Handler
  const handleRegenerateCode = async () => {
    if (!group) return;
    if (!confirm('Weet je zeker dat je een nieuwe uitnodigingscode wilt genereren? De oude code vervalt.')) return;
    setIsRegeneratingCode(true);
    try {
      const res = await regenerateInviteCodeAction(group.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Nieuwe uitnodigingscode gegenereerd: ${res.newCode}`);
      }
    } catch {
      toast.error('Fout bij genereren van code.');
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  // Create Homework Handler
  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    if (!hwTitle.trim() || !hwDescription.trim() || !hwDueDate) {
      toast.error('Titel, beschrijving en deadline zijn verplicht.');
      return;
    }

    setIsCreatingHomework(true);
    try {
      const res = await createHomeworkAction({
        groupId: group.id,
        title: hwTitle,
        description: hwDescription,
        guidelines: hwGuidelines,
        due_date: hwDueDate,
        chart_url: hwChartUrl,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Opdracht succesvol klaargezet voor de groep!');
        setIsCreateHomeworkOpen(false);
        setHwTitle('');
        setHwDescription('');
        setHwGuidelines('');
        setHwDueDate('');
        setHwChartUrl('');
      }
    } catch {
      toast.error('Fout bij het aanmaken van de opdracht.');
    } finally {
      setIsCreatingHomework(false);
    }
  };

  // Submit Homework Handler
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeworkForSubmission) return;
    if (!subContent.trim()) {
      toast.error('Voeg een beschrijving of analyse toe.');
      return;
    }

    setIsSubmittingHw(true);
    try {
      const res = await submitHomeworkAction(
        selectedHomeworkForSubmission.id,
        subContent,
        subChartUrl
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Opdracht succesvol ingeleverd!');
        setIsSubmitModalOpen(false);
        setSelectedHomeworkForSubmission(null);
        setSubContent('');
        setSubChartUrl('');
      }
    } catch {
      toast.error('Fout bij het inleveren van de opdracht.');
    } finally {
      setIsSubmittingHw(false);
    }
  };

  // Grade Submission Handler
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;

    setIsGrading(true);
    try {
      const res = await gradeSubmissionAction(
        selectedSubmissionForGrading.id,
        gradeInput,
        feedbackInput
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Beoordeling en feedback opgeslagen!');
        setSelectedSubmissionForGrading(null);
        setGradeInput('');
        setFeedbackInput('');
      }
    } catch {
      toast.error('Fout bij het opslaan van de beoordeling.');
    } finally {
      setIsGrading(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: USER IS NOT IN A GROUP
  // -------------------------------------------------------------
  if (!group) {
    return (
      <div className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full">
        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto pt-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
            <Users size={24} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Mentorship & Trading Groups
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Verbind met jouw trading mentor, voer gerichte analyse-opdrachten uit, en til je discipline naar een hoger niveau in een besloten community.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Join Group Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  Voor Traders & Studenten
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Word Lid van een Groep
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Heb je een uitnodigingscode ontvangen van je mentor? Voer deze hieronder in om direct toegang te krijgen tot de groep en de opdrachten.
              </p>

              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Uitnodigingscode
                  </label>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="bijv. YI6BFI"
                    maxLength={10}
                    className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-center tracking-widest text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining || !joinCodeInput.trim()}
                  className="w-full h-11 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isJoining ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Aansluiten bij Groep</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Toegang tot exclusieve taken & mentor-feedback</span>
            </div>
          </div>

          {/* Create Group Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  Voor Mentors & Beheerders
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Start een Nieuwe Groep
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Begeleid je eigen studenten. Maak een groep aan, genereer unieke uitnodigingscodes en zet huiswerkopdrachten klaar met duidelijke richtlijnen.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automatisch gegenereerde unieke uitnodigingscodes</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Opdrachten klaarzetten met deadlines en grafieken</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Inzendingen nakijken en cijfers/feedback geven</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="w-full h-11 rounded-lg bg-white hover:bg-slate-50 text-zinc-900 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                <span>Nieuwe Groep Aanmaken</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Create Group */}
        {isCreateGroupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-zinc-900" />
                  Nieuwe Groep Aanmaken
                </h3>
                <button
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Groepsnaam *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="bijv. Alpha FX Mentorship"
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Beschrijving *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Korte beschrijving van de doelen, focus en handelsstijl van de groep..."
                    className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Logo URL (optioneel)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={groupLogoUrl}
                      onChange={(e) => setGroupLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                    />
                    {groupLogoUrl && (
                      <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={groupLogoUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>Er wordt automatisch een unieke uitnodigingscode gegenereerd na het opslaan.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateGroupOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingGroup || !groupName.trim()}
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isCreatingGroup && <RefreshCw size={14} className="animate-spin" />}
                    <span>Groep Aanmaken</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: USER IS IN AN ACTIVE GROUP
  // -------------------------------------------------------------
  const groupDesc = (group.description || (typeof group.settings?.description === 'string' ? group.settings.description : '')) || '';
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/group?join=${group.invite_code}` : '';

  // Pending homework check for student
  const openHomeworkCount = homeworkList.filter(
    (h) => !mySubmissions.some((s) => s.homework_id === h.id)
  ).length;

  return (
    <div className="flex-1 p-6 md:p-8 max-w-[1300px] mx-auto w-full space-y-6">
      
      {/* --- NOTIFICATION / STATUS UPDATE BANNER FOR STUDENTS --- */}
      {!isMentor && (openHomeworkCount > 0 || unreadNotificationsCount > 0) && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Openstaande opdrachten vereisen actie ({openHomeworkCount})
              </h4>
              <p className="text-[11px] text-amber-700">
                Je hebt {openHomeworkCount} opdracht(en) klaarstaan van je mentor die nog ingeleverd moeten worden.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('homework')}
            className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Bekijk opdrachten
          </button>
        </div>
      )}

      {/* --- GROUP HEADER CARD --- */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Group Identity */}
          <div className="flex items-start gap-4">
            {group.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={group.logo_url}
                alt={group.name}
                className="h-16 w-16 rounded-xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0 tracking-wider">
                {group.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {group.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isMentor 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isMentor ? 'Mentor / Eigenaar' : 'Student / Lid'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {members.length} {members.length === 1 ? 'lid' : 'leden'}
                </span>
              </div>

              {groupDesc ? (
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  {groupDesc}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Geen groepsbeschrijving opgegeven.
                </p>
              )}
            </div>
          </div>

          {/* Right: Invite Code & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Invite Code Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                  Uitnodigingscode
                </span>
                <span className="font-mono text-sm font-extrabold text-slate-900 tracking-widest">
                  {group.invite_code}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(group.invite_code, 'code')}
                  title="Kopieer uitnodigingscode"
                  className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                  {hasCopiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleCopy(inviteUrl, 'link')}
                  title="Kopieer uitnodigingslink"
                  className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                  {hasCopiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                </button>
                {isMentor && (
                  <button
                    onClick={handleRegenerateCode}
                    disabled={isRegeneratingCode}
                    title="Nieuwe code genereren"
                    className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isRegeneratingCode ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>
            </div>

            {/* Leave Group Button */}
            {!isMentor && (
              <button
                onClick={handleLeaveGroup}
                className="h-10 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Groep verlaten"
              >
                <LogOut size={14} />
                <span>Verlaten</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users size={14} />
            <span>Actieve Leden ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('homework')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'homework'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={14} />
            <span>Opdrachten & Huiswerk ({homeworkList.length})</span>
            {!isMentor && openHomeworkCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {openHomeworkCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ACTIVE MEMBERS LIST */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'members' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Groepsleden & Trader Profielen
              </h2>
              <p className="text-xs text-slate-500">
                Overzicht van alle actieve studenten en mentoren in deze groep.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60">
              Totaal actieve leden: <span className="text-slate-900 font-bold">{members.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Lid</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Start Equity</th>
                  <th className="py-3 px-4">Sessies</th>
                  <th className="py-3 px-4">Strategieën</th>
                  {isMentor && <th className="py-3 px-4 text-right">Acties</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {members.map((member) => {
                  const isMemberMentor = member.id === group.mentor_id || member.id === group.owner_id || member.role === 'mentor';
                  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Anonieme Trader';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isMemberMentor 
                              ? 'bg-zinc-900 text-white' 
                              : 'bg-slate-100 border border-slate-200 text-slate-700'
                          }`}>
                            {fullName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {fullName}
                              {member.id === currentUser.id && (
                                <span className="ml-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                  (Jij)
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: {member.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isMemberMentor
                            ? 'bg-zinc-950 text-white'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}>
                          {isMemberMentor ? 'Mentor' : 'Student'}
                        </span>
                      </td>

                      {/* Starting Equity */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {member.currency || 'USD'} {Number(member.starting_equity || 0).toLocaleString()}
                      </td>

                      {/* Sessions */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.sessions && member.sessions.length > 0 ? (
                            member.sessions.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60 text-[10px] text-slate-600"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Strategies */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.strategies && member.strategies.length > 0 ? (
                            member.strategies.slice(0, 2).map((st) => (
                              <span
                                key={st}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 text-[10px] text-emerald-700 font-medium"
                              >
                                {st}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                          {member.strategies && member.strategies.length > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{member.strategies.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      {isMentor && (
                        <td className="py-3.5 px-4 text-right">
                          {member.id !== currentUser.id && !isMemberMentor && (
                            <button
                              onClick={() => handleRemoveMember(member.id, fullName)}
                              className="px-2.5 py-1 rounded text-[11px] font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                              title="Verwijder lid uit groep"
                            >
                              Verwijder
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: HOMEWORK & ASSIGNMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Opdrachten & Analyses
              </h2>
              <p className="text-xs text-slate-500">
                {isMentor 
                  ? 'Zet opdrachten klaar met richtlijnen en deadlines voor jouw studenten.' 
                  : 'Bekijk opdrachten van je mentor, voer analyses uit en lever je huiswerk in.'}
              </p>
            </div>

            {isMentor && (
              <button
                onClick={() => setIsCreateHomeworkOpen(true)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Nieuwe Opdracht Klaarzetten</span>
              </button>
            )}
          </div>

          {/* Homework List Grid */}
          {homeworkList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Nog geen opdrachten klaargezet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {isMentor 
                  ? 'Klik op "Nieuwe Opdracht Klaarzetten" om een eerste taak of analyseopdracht voor je studenten aan te maken.' 
                  : 'Je mentor heeft nog geen opdrachten klaargezet voor deze groep.'}
              </p>
              {isMentor && (
                <button
                  onClick={() => setIsCreateHomeworkOpen(true)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Opdracht Aanmaken
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {homeworkList.map((hw) => {
                const submission = mySubmissions.find((s) => s.homework_id === hw.id);
                const allSubmissionsForHw = submissions.filter((s) => s.homework_id === hw.id);
                const dueDate = new Date(hw.due_date);
                const isPastDue = dueDate.getTime() < now;

                // Status parsing
                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase">
                    Nieuw / Open
                  </span>
                );

                if (submission) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Ingeleverd {submission.grade ? `· Cijfer: ${submission.grade}` : ''}
                    </span>
                  );
                } else if (isPastDue) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase">
                      Verlopen
                    </span>
                  );
                }

                return (
                  <div
                    key={hw.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
                  >
                    {/* Homework Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-slate-900">
                            {hw.title}
                          </h3>
                          {statusBadge}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Geplaatst: {new Date(hw.created_at).toLocaleDateString('nl-NL')}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <Clock size={12} className={isPastDue ? 'text-red-500' : 'text-amber-500'} />
                            Deadline: {dueDate.toLocaleDateString('nl-NL')} om {dueDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div>
                        {!isMentor && !submission && (
                          <button
                            onClick={() => {
                              setSelectedHomeworkForSubmission(hw);
                              setIsSubmitModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Send size={12} />
                            <span>Inleveren</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {hw.description}
                    </div>

                    {/* Guidelines Callout (if present separately) */}
                    {hw.guidelines && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Richtlijnen & Criteria
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {hw.guidelines}
                        </p>
                      </div>
                    )}

                    {/* Attached Chart Link */}
                    {hw.chart_url && (
                      <div className="flex items-center gap-2">
                        <a
                          href={hw.chart_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all"
                        >
                          <ExternalLink size={13} />
                          <span>Bekijk bijbehorende grafiek / TradingView analyse</span>
                        </a>
                      </div>
                    )}

                    {/* Student View: My Submission Details */}
                    {!isMentor && submission && (
                      <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-4 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Jouw Inzending
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Ingeleverd op {new Date(submission.created_at).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line mb-3">
                          {submission.content}
                        </p>
                        {submission.chart_url && (
                          <a
                            href={submission.chart_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline mb-2"
                          >
                            <ExternalLink size={12} />
                            Jouw grafieklink bekijken
                          </a>
                        )}

                        {/* Grade & Feedback from mentor */}
                        {submission.grade || submission.feedback ? (
                          <div className="pt-3 mt-3 border-t border-emerald-200/60 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                Beoordeling van Mentor:
                              </span>
                              {submission.grade && (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs">
                                  {submission.grade}
                                </span>
                              )}
                            </div>
                            {submission.feedback && (
                              <p className="text-xs text-slate-700 italic bg-white/70 p-2.5 rounded border border-emerald-100">
                                &ldquo;{submission.feedback}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-emerald-700 italic">
                            Inzending ontvangen. Wachten op beoordeling van de mentor.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mentor View: Student Inzendingen List */}
                    {isMentor && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Inzendingen van Studenten ({allSubmissionsForHw.length} / {members.filter(m => m.id !== group.mentor_id).length})
                          </span>
                        </div>

                        {allSubmissionsForHw.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            Nog geen studenten hebben deze opdracht ingeleverd.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {allSubmissionsForHw.map((sub) => {
                              const studentName = `${sub.student?.first_name || ''} ${sub.student?.last_name || ''}`.trim() || 'Student';

                              return (
                                <div
                                  key={sub.id}
                                  className="bg-slate-50 border border-slate-200/70 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-xs text-slate-900">
                                        {studentName}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(sub.created_at).toLocaleDateString('nl-NL')} om {new Date(sub.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {sub.grade && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                          Cijfer: {sub.grade}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-700 line-clamp-2">
                                      {sub.content}
                                    </p>
                                    {sub.chart_url && (
                                      <a
                                        href={sub.chart_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-semibold"
                                      >
                                        <ExternalLink size={11} />
                                        Grafieklink bekijken
                                      </a>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedSubmissionForGrading(sub);
                                      setGradeInput(sub.grade || '');
                                      setFeedbackInput(sub.feedback || '');
                                    }}
                                    className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-xs"
                                  >
                                    {sub.grade ? 'Beoordeling Bewerken' : 'Beoordelen & Feedback'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE HOMEWORK (Mentor) */}
      {/* ------------------------------------------------------------- */}
      {isCreateHomeworkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-zinc-900" />
                Nieuwe Opdracht Klaarzetten
              </h3>
              <button
                onClick={() => setIsCreateHomeworkOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Titel van de Opdracht *
                </label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="bijv. Analyseer EUR/USD London Breakout met Risk/Reward > 1:3"
                  className="w-full h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Beschrijving & Taak *
                </label>
                <textarea
                  rows={3}
                  required
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                  placeholder="Wat is het doel van de opdracht en wat moeten studenten onderzoeken?"
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Richtlijnen & Beoordelingscriteria *
                </label>
                <textarea
                  rows={3}
                  required
                  value={hwGuidelines}
                  onChange={(e) => setHwGuidelines(e.target.value)}
                  placeholder="bijv. 1. Geef duidelijke screenshots. 2. Licht entry, SL en TP toe. 3. Beschrijf emotie en risicobeheer."
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Deadline (Datum & Tijd) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Grafiek URL (optioneel)
                  </label>
                  <input
                    type="url"
                    value={hwChartUrl}
                    onChange={(e) => setHwChartUrl(e.target.value)}
                    placeholder="https://www.tradingview.com/x/..."
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-3 text-[11px] text-blue-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-blue-600" />
                <span>Studenten in deze groep ontvangen direct een statusupdate over de nieuwe opdracht.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateHomeworkOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isCreatingHomework}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isCreatingHomework && <RefreshCw size={14} className="animate-spin" />}
                  <span>Opdracht Publiceren</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUBMIT HOMEWORK (Student) */}
      {/* ------------------------------------------------------------- */}
      {isSubmitModalOpen && selectedHomeworkForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send size={16} className="text-zinc-900" />
                Opdracht Inleveren
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Opdracht
              </span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {selectedHomeworkForSubmission.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                Deadline: {new Date(selectedHomeworkForSubmission.due_date).toLocaleString('nl-NL')}
              </p>
            </div>

            <form onSubmit={handleSubmitHomework} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Jouw Uitwerking & Analyse *
                </label>
                <textarea
                  rows={4}
                  required
                  value={subContent}
                  onChange={(e) => setSubContent(e.target.value)}
                  placeholder="Beschrijf je bevindingen, de setup, en beantwoord de richtlijnen van je mentor..."
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Grafieklink (TradingView / Screenshot URL)
                </label>
                <input
                  type="url"
                  value={subChartUrl}
                  onChange={(e) => setSubChartUrl(e.target.value)}
                  placeholder="https://www.tradingview.com/x/..."
                  className="w-full h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHw || !subContent.trim()}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingHw && <RefreshCw size={14} className="animate-spin" />}
                  <span>Inleveren voor Beoordeling</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: GRADE SUBMISSION (Mentor) */}
      {/* ------------------------------------------------------------- */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award size={16} className="text-zinc-900" />
                Inzending Beoordelen
              </h3>
              <button
                onClick={() => setSelectedSubmissionForGrading(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Inzending review */}
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  {selectedSubmissionForGrading.student?.first_name || 'Student'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(selectedSubmissionForGrading.created_at).toLocaleString('nl-NL')}
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line">
                {selectedSubmissionForGrading.content}
              </p>
              {selectedSubmissionForGrading.chart_url && (
                <a
                  href={selectedSubmissionForGrading.chart_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                >
                  <ExternalLink size={12} />
                  Grafiek bekijken in nieuw tabblad
                </a>
              )}
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Cijfer of Score (bijv. &apos;8.5&apos;, &apos;A+&apos;, of &apos;Voldoende&apos;)
                </label>
                <input
                  type="text"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="bijv. 8.5 of Uitstekend"
                  className="w-full h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Feedback & Aanbevelingen
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Geef constructieve feedback op de trade context, risicobeheersing en emotie..."
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionForGrading(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isGrading}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isGrading && <RefreshCw size={14} className="animate-spin" />}
                  <span>Beoordeling Opslaan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
