import { requireRole } from "@/lib/auth";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export default async function LecturerSettingsPage() {
  const profile = await requireRole(["lecturer", "admin"]);

  return (
    <DashboardLayout profile={profile} title="Settings">
      <PageBanner
        title="Account Settings"
        subtitle="Manage your profile and security preferences"
      />
      <ProfileSettingsForm profile={profile} />
    </DashboardLayout>
  );
}
