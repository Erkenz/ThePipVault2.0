"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  User, 
  Wallet, 
  Settings as SettingsIcon, 
  Trash2, 
  RotateCcw, 
  Plus, 
  X, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { 
  updateProfileSettings, 
  resetProfileSettings, 
  deleteAccountAction 
} from "./actions";

interface Profile {
  first_name: string;
  last_name: string;
  currency: string;
  starting_equity: number | string;
  strategies: string[];
  sessions: string[];
}

export default function SettingsClient({
  initialProfile,
  email
}: {
  initialProfile: Profile;
  email: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [newStrategy, setNewStrategy] = useState("");
  const [newSession, setNewSession] = useState("");
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Input changes (allowing empty inputs for numeric properties while typing)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add tag helpers
  const handleAddStrategy = () => {
    const value = newStrategy.trim();
    if (!value) return;
    if (profile.strategies.includes(value)) {
      toast.error("Strategy already exists");
      return;
    }
    setProfile(prev => ({
      ...prev,
      strategies: [...prev.strategies, value]
    }));
    setNewStrategy("");
  };

  const handleRemoveStrategy = (strat: string) => {
    setProfile(prev => ({
      ...prev,
      strategies: prev.strategies.filter(s => s !== strat)
    }));
  };

  const handleAddSession = () => {
    const value = newSession.trim();
    if (!value) return;
    if (profile.sessions.includes(value)) {
      toast.error("Session already exists");
      return;
    }
    setProfile(prev => ({
      ...prev,
      sessions: [...prev.sessions, value]
    }));
    setNewSession("");
  };

  const handleRemoveSession = (sess: string) => {
    setProfile(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s !== sess)
    }));
  };

  // Action triggers
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        ...profile,
        starting_equity: Number(profile.starting_equity) || 0
      };
      const result = await updateProfileSettings(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Settings updated successfully!");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred while saving.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm("Are you sure you want to reset your default strategies, sessions, and account parameters to system defaults? Your name will not be affected.")) {
      return;
    }
    setIsResetting(true);

    try {
      const result = await resetProfileSettings();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Settings reset to system defaults.");
        // Instantly update state to match defaults
        setProfile(prev => ({
          ...prev,
          currency: "USD",
          starting_equity: 0,
          strategies: ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
          sessions: ["London", "New York", "Tokyo", "Sydney"]
        }));
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred during reset.");
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion.");
      return;
    }
    setIsDeleting(true);

    try {
      const result = await deleteAccountAction();
      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      } else {
        toast.success("Account and data permanently deleted.");
        // Redirect to login page
        window.location.href = "/login";
      }
    } catch (err) {
      toast.error("An unexpected error occurred during deletion.");
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8 bg-slate-50">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage your profile details, risk settings, and trading configurations.
        </p>
      </div>

      {/* Left-aligned page wrapper to match other dashboards */}
      <div className="max-w-[1000px] space-y-8 text-slate-900">

        {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Section 1: Basic Profile */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Profile Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                First Name
              </label>
              <input
                required
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Last Name
              </label>
              <input
                required
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email Address (Immutable)
            </label>
            <input
              disabled
              type="email"
              value={email}
              className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-md px-3 py-2 text-xs font-semibold cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Section 2: Account Currency & Equity */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Wallet size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Risk & Capital Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Default Currency
              </label>
              <select
                name="currency"
                value={profile.currency}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all h-[34px]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="CHF">CHF (Fr)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Starting Equity ({profile.currency})
              </label>
              <input
                type="number"
                step="any"
                name="starting_equity"
                value={profile.starting_equity}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Personalized Trading Setups & Sessions */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-8">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SettingsIcon size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Trading Configurations
            </h2>
          </div>

          {/* Strategies Tag Input */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-700">Trading Setups (Strategies)</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Manage the custom strategies that populate in your trade logs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 border-dashed rounded-md min-h-[50px]">
              {profile.strategies.length === 0 ? (
                <span className="text-xs text-slate-400 italic font-medium p-1">No strategies added.</span>
              ) : (
                profile.strategies.map((strat) => (
                  <span 
                    key={strat} 
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 pl-2.5 pr-1.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm hover:border-slate-300 transition-all"
                  >
                    {strat}
                    <button
                      type="button"
                      onClick={() => handleRemoveStrategy(strat)}
                      className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Setup (e.g. Golden Cross)"
                value={newStrategy}
                onChange={(e) => setNewStrategy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStrategy();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
              <button
                type="button"
                onClick={handleAddStrategy}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          {/* Sessions Tag Input */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-700">Trading Sessions</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Specify the market sessions you participate in.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 border-dashed rounded-md min-h-[50px]">
              {profile.sessions.length === 0 ? (
                <span className="text-xs text-slate-400 italic font-medium p-1">No sessions added.</span>
              ) : (
                profile.sessions.map((sess) => (
                  <span 
                    key={sess} 
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 pl-2.5 pr-1.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm hover:border-slate-300 transition-all"
                  >
                    {sess}
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(sess)}
                      className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Session (e.g. London Close)"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSession();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSession}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </form>

      {/* Separator / Divider */}
      <hr className="border-slate-200 my-8" />

      {/* Maintenance & Danger Zones at the Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Default Reset Panel */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Maintenance
            </h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2">
              Need to restore system configurations? Resetting will revert strategies, sessions, currency, and capital to the initial application settings.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSettings}
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-350 text-slate-700 bg-slate-50 hover:bg-slate-100/50 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isResetting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            Reset to System Defaults
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-md p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Danger Zone
            </h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2">
              Permanently delete your profile and wipe all logged trade journal records forever. This process is irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 animate-in fade-in duration-150">
          <div className="relative w-full max-w-[450px] bg-white border border-slate-200 rounded-md shadow-xl p-6 space-y-6">
            
            {/* Modal Title */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 border border-red-200 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-none mb-1.5">
                  Are you absolutely sure?
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  This action is irreversible. All trade journals, setups, performance metrics, and auth files will be destroyed forever.
                </p>
              </div>
            </div>

            {/* Instruction */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Type <span className="font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-100">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Wipe All Data"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
