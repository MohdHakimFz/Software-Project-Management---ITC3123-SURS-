import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { Profile } from "@/types/database";

interface DashboardLayoutProps {
  profile: Profile;
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ profile, children, title }: DashboardLayoutProps) {
  return (
    <DashboardShell profile={profile} title={title}>
      {children}
    </DashboardShell>
  );
}
