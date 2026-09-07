'use client';

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type CustomSelectOption = string | { label: string; value: string };

interface CustomSelectProps {
  name: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (e: { target: { name: string; value: any } }) => void;
  variant?: "light" | "dark";
}

export default function CustomSelect({ 
  name, 
  value, 
  options, 
  onChange,
  variant = "light"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to key-value objects
  const normalizedOptions = options.map(opt => 
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  // Find currently active option
  const activeOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions.find(opt => opt.label === value);
  const activeLabel = activeOption ? activeOption.label : value || "Select...";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = variant === "dark";
  const buttonClasses = isDark
    ? `w-full flex justify-between items-center bg-zinc-900 border rounded-md px-2.5 py-1.5 text-[11px] font-bold outline-none transition-all duration-150 ${
        isOpen ? "border-zinc-700 bg-zinc-900 text-white shadow-sm" : "border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80"
      }`
    : `w-full flex justify-between items-center bg-slate-50 border rounded-md px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition-all duration-150 ${
        isOpen ? "border-slate-400 bg-white shadow-sm" : "border-slate-200 hover:border-slate-350 hover:bg-slate-100/50"
      }`;

  const chevronClasses = isDark
    ? `text-zinc-500 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`
    : `text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`;

  const dropdownClasses = isDark
    ? "absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-zinc-900 border border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
    : "absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150";

  const getOptionClasses = (optValue: string) => {
    if (isDark) {
      return `px-2.5 py-1.5 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
        value === optValue
          ? "bg-zinc-800 text-white font-bold"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      }`;
    } else {
      return `px-3 py-2 text-xs rounded cursor-pointer transition-colors ${
        value === optValue
          ? "bg-slate-100 text-slate-900 font-bold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`;
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown size={14} className={chevronClasses} />
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {normalizedOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setIsOpen(false);
                }}
                className={getOptionClasses(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
