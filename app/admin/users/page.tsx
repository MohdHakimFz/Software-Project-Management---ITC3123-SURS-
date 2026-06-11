import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersList } from "@/components/admin/users-list";

export default async function AdminUsersPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [{ data: users }, { data: programmes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, programmes(code)")
      .order("role")
      .order("full_name"),
    supabase.from("programmes").select("*").eq("is_active", true).order("code"),
  ]);

  return (
    <DashboardLayout profile={profile} title="User Management">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users ({users?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList users={users ?? []} programmes={programmes ?? []} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
