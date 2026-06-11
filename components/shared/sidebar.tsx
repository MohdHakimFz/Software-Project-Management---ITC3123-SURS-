"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CreditCard,
  Users,
  Settings,
  FileText,
  GraduationCap,
  LogOut,
  BookMarked,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { getRoleLabel } from "@/lib/role-labels";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "Courses", icon: BookOpen },
    { href: "/student/enrollment", label: "Enrollment", icon: GraduationCap },
    { href: "/student/timetable", label: "Timetable", icon: Calendar },
    { href: "/student/fees", label: "Fees & Payment", icon: CreditCard },
    { href: "/student/settings", label: "Settings", icon: Settings },
  ],
  staff: [
    { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/students", label: "Students", icon: Users },
    { href: "/staff/courses", label: "Courses", icon: BookOpen },
    { href: "/staff/settings", label: "Settings", icon: Settings },
  ],
  lecturer: [
    { href: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lecturer/my-courses", label: "My Courses", icon: BookMarked },
    { href: "/lecturer/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/config", label: "Configuration", icon: Settings },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  onNavigate?: () => void;
}

export function Sidebar({ role, userName, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV_ITEMS[role];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="safe-bottom flex h-full min-h-app w-full flex-col bg-gradient-to-b from-uptm-blue to-[#001a33] text-white shadow-xl">
      <div className="flex h-[4.5rem] shrink-0 items-center border-b border-white/10 px-6">
        <Logo
          href="/"
          size="md"
          textClassName="text-lg leading-tight text-white"
          subtitleClassName="text-xs leading-tight text-white/60"
        />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-white font-semibold text-[#003366] shadow-md shadow-black/20 [&_svg]:text-[#003366]"
                  : "text-white/85 hover:bg-white/10 hover:text-white hover:translate-x-0.5 [&_svg]:text-white/85"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isActive ? "text-[#003366]" : "group-hover:scale-110"
                )}
              />
              <span className={cn(isActive ? "text-[#003366]" : undefined)}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-white/10 p-4">
        <Link
          href={`/${role}/settings`}
          onClick={onNavigate}
          className="mb-3 block rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
        >
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="mt-0.5 text-xs text-sky-200">{getRoleLabel(role)}</p>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/75 transition-colors hover:bg-red-500/20 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
