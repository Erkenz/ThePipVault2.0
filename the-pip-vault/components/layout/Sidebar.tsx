// src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, Settings, Plus, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-zinc-950 border-r border-zinc-900 transition-[width] duration-200 ${
        isCollapsed ? "w-[64px]" : "w-[240px]"
      }`}
    >
      {/* Logo Area */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-900">
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