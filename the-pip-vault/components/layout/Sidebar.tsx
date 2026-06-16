"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, Settings, Plus, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false); // Nieuwe state
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // useEffect wordt alleen in de browser uitgevoerd, nooit op de server
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col glass transition-[width] duration-300 ${
        isCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 shadow-lg shadow-primary/25">
            <span className="font-bold text-white">P</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold tracking-tight text-lg whitespace-nowrap">
              ThePip<span className="text-gradient">Vault</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Action */}
      <div className="p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
          <Plus size={18} />
          {!isCollapsed && <span>NEW TRADE</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                isActive 
                  ? "bg-primary/10 border border-primary/20 text-primary" 
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground border border-transparent"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-primary" : "group-hover:text-foreground"} />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 h-8 w-1 rounded-r-full bg-gradient-to-b from-primary to-violet-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggles */}
      <div className="p-4 border-t border-border/40 flex flex-col gap-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground mx-auto transition-colors"
        >
          {/* Alleen het icoon renderen als we in de browser zijn */}
          {mounted ? (
            theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
          ) : (
            <div className="w-[18px] h-[18px]" /> /* Placeholder tijdens server render */
          )}
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground mx-auto transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}