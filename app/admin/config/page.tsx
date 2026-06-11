import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigForm } from "@/components/admin/config-form";
import { FeeStructuresList } from "@/components/admin/fee-structures-list";
import { parseAcademicCalendar } from "@/lib/academic-calendar";

export default async function AdminConfigPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [{ data: config }, { data: feeStructures }] = await Promise.all([
    supabase.from("system_config").select("*"),
    supabase
      .from("fee_structures")
      .select("*, programmes(code, name, is_active, level)")
      .eq("is_active", true)
      .order("programme_id"),
  ]);

  const calendar = parseAcademicCalendar(config ?? []);
  const currentSemester = calendar.semester;

  const activeFees = (feeStructures ?? [])
    .filter((fee) => (fee.programmes as { is_active?: boolean })?.is_active !== false)
    .filter((fee) => fee.semester === currentSemester)
    .sort((a, b) =>
      ((a.programmes as { code?: string })?.code ?? "").localeCompare(
        (b.programmes as { code?: string })?.code ?? ""
      )
    );

  const outdatedCount =
    (feeStructures ?? []).filter(
      (fee) =>
        (fee.programmes as { is_active?: boolean })?.is_active !== false &&
        fee.semester !== currentSemester
    ).length ?? 0;

  return (
    <DashboardLayout profile={profile} title="System Configuration">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfigForm config={config ?? []} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-lg">
              Fee Structures
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({activeFees.length} programmes)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <FeeStructuresList
              fees={activeFees}
              currentSemester={currentSemester}
              outdatedCount={outdatedCount}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
