// src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, Settings, Plus, ChevronLeft, ChevronRight, LogOut, Wallet } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

interface SidebarProps {
  initialAccounts: {
    id: string;
    name: string;
    currency: string;
  }[];
  selectedAccountId: string;
}

export function Sidebar({ initialAccounts, selectedAccountId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Accounts", href: "/accounts", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    document.cookie = `selected_account_id=${val}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-zinc-950 border-r border-zinc-900 transition-[width] duration-200 ${
        isCollapsed ? "w-[64px]" : "w-[240px]"
      }`}
    >
      {/* Logo Area */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-white shadow-sm">
            <span className="font-bold text-sm tracking-tight">P</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold tracking-tight text-sm text-zinc-100 whitespace-nowrap">
              ThePip<span className="text-zinc-500">Vault</span>
            </span>
          )}
        </div>
      </div>

      {/* Account Selector */}
      <div className="px-3 py-3 border-b border-zinc-900 flex flex-col gap-1 overflow-hidden shrink-0">
        {!isCollapsed ? (
          <>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block px-1">
              Account View
            </label>
            <select
              value={selectedAccountId}
              onChange={handleAccountChange}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md px-2 py-1.5 text-[11px] font-bold focus:border-zinc-700 outline-none cursor-pointer transition-colors"
            >
              <option value="overall">Overall (All accounts)</option>
              {initialAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </>
        ) : (
          <div className="h-8 flex items-center justify-center text-zinc-400" title={`Active: ${selectedAccountId === "overall" ? "Overall" : "Filtered Account"}`}>
            <Wallet size={16} />
          </div>
        )}
      </div>

      {/* Main Action */}
      <div className="p-3">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white hover:bg-zinc-100 py-2 text-xs font-semibold text-zinc-950 border border-zinc-200 shadow-sm transition-all uppercase tracking-wider">
          <Plus size={14} />
          {!isCollapsed && <span>New Trade</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2.5 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 border transition-all ${
                isActive 
                  ? "bg-zinc-900 border-zinc-800 text-white font-medium shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border-transparent"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-350"} />
              {!isCollapsed && <span className="text-xs font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggles */}
      <div className="p-3 border-t border-zinc-900 flex flex-col gap-2">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 border transition-all text-zinc-400 hover:text-red-400 hover:bg-red-950/20 border-transparent cursor-pointer ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Log Out"
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Log Out</span>}
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white mx-auto transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}