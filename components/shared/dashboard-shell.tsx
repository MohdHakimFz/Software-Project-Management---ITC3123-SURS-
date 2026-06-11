"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/shared/sidebar";
import { Menu, User, X } from "lucide-react";
import type { Profile } from "@/types/database";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { getPortalLabel } from "@/lib/role-labels";

interface DashboardShellProps {
  profile: Profile;
  title?: string;
  children: React.ReactNode;
}

export function DashboardShell({ profile, title, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-app page-gradient">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm print:hidden lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — full viewport height on desktop */}
      <div
        className={cn(
          "dashboard-chrome fixed inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-300 print:hidden",
          "lg:sticky lg:top-0 lg:h-app lg:self-start",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          role={profile.role}
          userName={profile.full_name}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <main className="flex min-h-app min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="dashboard-chrome safe-top sticky top-0 z-30 flex h-[4.5rem] shrink-0 items-center border-b border-border bg-background/80 px-4 backdrop-blur-md print:hidden sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="touch-target shrink-0 rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-muted active:scale-95 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-muted-foreground">
                  {getPortalLabel(profile.role)}
                </p>
                {title && (
                  <h1 className="truncate text-lg font-bold leading-tight text-uptm-blue dark:text-foreground md:text-xl">
                    {title}
                  </h1>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                href={`/${profile.role}/settings`}
                className="touch-target rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-muted sm:hidden"
                aria-label="Account settings"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href={`/${profile.role}/settings`}
                className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm transition-colors hover:bg-muted sm:flex"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="max-w-[12rem] truncate font-medium">{profile.full_name}</span>
                {profile.student_id && (
                  <span className="text-xs text-muted-foreground">{profile.student_id}</span>
                )}
              </Link>
            </div>
          </div>
        </header>
        <div className="safe-bottom min-w-0 flex-1 overflow-x-hidden p-3 print:p-0 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
