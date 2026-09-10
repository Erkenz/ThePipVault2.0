'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  X, 
  Loader2,
  DollarSign
} from "lucide-react";
import { 
  addAccountAction, 
  updateAccountAction, 
  deleteAccountAction 
} from "./actions";
import CustomSelect from "@/components/journal/CustomSelect";

interface Account {
  id: string;
  name: string;
  type: string;
  status: string;
  start_amount: number;
  currency: string;
  is_default: boolean;
  created_at: string;
}

const currencyOptions = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];
const statusOptions = ["Active", "Passed", "Blown"];

export default function AccountsClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    start_amount: "",
    currency: "USD",
    status: "Active",
    is_default: false
  });

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      name: "",
      type: "",
      start_amount: "",
      currency: "USD",
      status: "Active",
      is_default: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setFormData({
      name: acc.name,
      type: acc.type,
      start_amount: acc.start_amount.toString(),
      currency: acc.currency,
      status: acc.status,
      is_default: acc.is_default
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Account name is required");
      return;
    }
    if (!formData.start_amount.trim()) {
      toast.error("Starting amount is required");
      return;
    }

    setIsLoading(true);
    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      start_amount: Number(formData.start_amount) || 0,
      currency: formData.currency,
      status: formData.status,
      is_default: formData.is_default
    };

    try {
      if (editingAccount) {
        const res = await updateAccountAction(editingAccount.id, payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Account updated successfully");
          handleClose();
          router.refresh();
        }
      } else {
        const res = await addAccountAction(payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Account added successfully");
          handleClose();
          router.refresh();
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (accId: string, name: string) => {
    if (!confirm(`Warning: Deleting account "${name}" will also delete all trades linked to it. This action cannot be undone. Are you sure?`)) {
      return;
    }

    try {
      const res = await deleteAccountAction(accId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Account deleted successfully");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trading Accounts</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure and manage multiple accounts to log and map your copy-trading executions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all uppercase tracking-wider h-[38px] cursor-pointer"
        >
          <Plus size={14} /> Add Account
        </button>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div 
            key={acc.id}
            className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200"
          >
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-md border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">{acc.name}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 inline-block">
                      {acc.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {acc.is_default && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[8px] font-bold text-blue-700 uppercase tracking-wide">
                      Default
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                    acc.status === "Active" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : acc.status === "Passed"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-rose-50 border-rose-250 text-rose-700"
                  }`}>
                    {acc.status}
                  </span>
                </div>
              </div>

              {/* Amount info */}
              <div className="mt-6 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Capital</div>
                <div className="text-2xl font-bold tracking-tight text-slate-800">
                  {acc.currency} {acc.start_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 pt-5 mt-6 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(acc)}
                className="p-2 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-transparent"
                title="Edit Account"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDelete(acc.id, acc.name)}
                className="p-2 rounded hover:bg-red-50 text-slate-400 hover:text-red-650 transition-colors cursor-pointer border border-transparent"
                title="Delete Account"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-md p-12 text-center shadow-sm">
            <Wallet className="mx-auto text-slate-400 mb-3" size={32} />
            <h3 className="text-sm font-bold text-slate-900">No accounts configured</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
              Get started by adding your first broker or funding account parameter to log trades.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} /> Add Account
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 animate-in fade-in duration-150">
          <div className="relative w-full max-w-[500px] bg-white border border-slate-200 rounded-md shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {editingAccount ? "Edit Trading Account" : "Add Trading Account"}
              </h3>
              <button 
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Account Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. My Live FTMO 100K"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all h-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Broker / Type</label>
                  <input
                    required
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="e.g. FTMO, IC Markets, Demo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all h-[34px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Currency</label>
                  <CustomSelect
                    name="currency"
                    value={formData.currency}
                    options={currencyOptions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Starting Balance</label>
                  <input
                    required
                    type="number"
                    step="any"
                    name="start_amount"
                    value={formData.start_amount}
                    onChange={handleChange}
                    placeholder="10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-all h-[34px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Status</label>
                  <CustomSelect
                    name="status"
                    value={formData.status}
                    options={statusOptions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3 pl-1 select-none">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="rounded border-slate-200 text-slate-900 focus:ring-slate-400 h-4 w-4 bg-slate-50 outline-none cursor-pointer"
                />
                <label htmlFor="is_default" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as default trading account
                </label>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6 shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-slate-200 hover:bg-slate-50 text-slate-750 px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
