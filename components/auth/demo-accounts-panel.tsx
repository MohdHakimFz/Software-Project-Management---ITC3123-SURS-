"use client";

import { useState } from "react";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";
import { ChevronDown, GraduationCap, Shield, User, UserCog } from "lucide-react";

const ROLE_ICONS = {
  Student: GraduationCap,
  Staff: UserCog,
  Lecturer: User,
  Admin: Shield,
} as const;

const ROLE_STYLES = {
  Student: {
    row: "hover:border-sky-200 hover:bg-sky-50/80 dark:hover:border-sky-800 dark:hover:bg-sky-950/40",
    iconWrap: "bg-sky-100 dark:bg-sky-950/60",
    icon: "text-sky-600 dark:text-sky-400",
    action: "text-sky-600 dark:text-sky-400",
  },
  Staff: {
    row: "hover:border-[#003366]/20 hover:bg-[#003366]/5 dark:hover:border-sky-800 dark:hover:bg-sky-950/30",
    iconWrap: "bg-[#003366]/10 dark:bg-sky-950/50",
    icon: "text-[#003366] dark:text-sky-300",
    action: "text-[#003366] dark:text-sky-300",
  },
  Lecturer: {
    row: "hover:border-violet-200 hover:bg-violet-50/80 dark:hover:border-violet-800 dark:hover:bg-violet-950/40",
    iconWrap: "bg-violet-100 dark:bg-violet-950/60",
    icon: "text-violet-600 dark:text-violet-400",
    action: "text-violet-600 dark:text-violet-400",
  },
  Admin: {
    row: "hover:border-amber-200 hover:bg-amber-50/80 dark:hover:border-amber-800 dark:hover:bg-amber-950/40",
    iconWrap: "bg-amber-100 dark:bg-amber-950/60",
    icon: "text-amber-700 dark:text-amber-400",
    action: "text-amber-700 dark:text-amber-400",
  },
} as const;

interface DemoAccountsPanelProps {
  onSelect: (email: string, password: string) => void;
}

export function DemoAccountsPanel({ onSelect }: DemoAccountsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-card shadow-md dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-foreground dark:bg-slate-900/50"
      >
        <span>Demo accounts (presentation)</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-100 bg-card px-3 pb-3 pt-2 dark:border-slate-800">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = ROLE_ICONS[account.role as keyof typeof ROLE_ICONS] ?? User;
            const style = ROLE_STYLES[account.role as keyof typeof ROLE_STYLES];
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => onSelect(account.email, account.password)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left transition-colors dark:border-slate-800 dark:bg-slate-950/30",
                  style.row
                )}
              >
                <div className={cn("rounded-lg p-2", style.iconWrap)}>
                  <Icon className={cn("h-3.5 w-3.5", style.icon)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">{account.role}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{account.email}</p>
                </div>
                <span className={cn("shrink-0 text-[10px] font-semibold uppercase tracking-wide", style.action)}>
                  Use
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
