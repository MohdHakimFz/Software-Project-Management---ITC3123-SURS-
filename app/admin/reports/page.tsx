import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { ReportsView } from "@/components/admin/reports-view";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { normalizeAuditRow, normalizeProfileRow } from "@/lib/normalize-relations";

export default async function AdminReportsPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [
    { data: enrollments },
    { data: allPaidPayments },
    { data: recentPayments },
    { data: auditLogs },
    { count: studentCount },
  ] = await Promise.all([
    supabase.from("enrollments").select("status"),
    supabase
      .from("payments")
      .select("amount, tuition_amount, registration_amount, resource_amount")
      .eq("status", "paid"),
    supabase
      .from("payments")
      .select("*, profiles(full_name, student_id)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("audit_logs")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
  ]);

  const enrollmentStats = {
    pending: enrollments?.filter((e) => e.status === "pending").length ?? 0,
    paid: enrollments?.filter((e) => e.status === "paid").length ?? 0,
    confirmed: enrollments?.filter((e) => e.status === "confirmed").length ?? 0,
    cancelled: enrollments?.filter((e) => e.status === "cancelled").length ?? 0,
  };

  const paidPayments = allPaidPayments ?? [];

  const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const revenueBreakdown = paidPayments.reduce(
    (acc, p) => ({
      tuition: acc.tuition + Number(p.tuition_amount),
      registration: acc.registration + Number(p.registration_amount),
      resource: acc.resource + Number(p.resource_amount),
    }),
    { tuition: 0, registration: 0, resource: 0 }
  );

  return (
    <DashboardLayout profile={profile} title="Reports & Analytics">
      <PageBanner
        badge="Analytics"
        title="Reports & Analytics"
        subtitle="Track enrollments, revenue, payments, and system activity. Export data for reporting."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="border-0 bg-white/15 text-white hover:bg-white/25"
          >
            <a href="/api/admin/export?type=enrollments">
              <Download className="mr-2 h-4 w-4" />
              Enrollments CSV
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="border-0 bg-white/15 text-white hover:bg-white/25"
          >
            <a href="/api/admin/export?type=payments">
              <Download className="mr-2 h-4 w-4" />
              Payments CSV
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="border-0 bg-white/15 text-white hover:bg-white/25"
          >
            <a href="/api/admin/export?type=students">
              <Download className="mr-2 h-4 w-4" />
              Students CSV
            </a>
          </Button>
        </div>
      </PageBanner>

      <ReportsView
        enrollmentStats={enrollmentStats}
        totalRevenue={totalRevenue}
        revenueBreakdown={revenueBreakdown}
        studentCount={studentCount ?? 0}
        paidPaymentCount={paidPayments.length}
        recentPayments={(recentPayments ?? []).map(normalizeProfileRow)}
        auditLogs={(auditLogs ?? []).map(normalizeAuditRow)}
      />
    </DashboardLayout>
  );
}
