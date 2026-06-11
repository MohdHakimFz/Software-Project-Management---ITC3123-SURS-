import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { TableScroll } from "@/components/shared/table-scroll";
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

interface EnrollmentStats {
  pending: number;
  paid: number;
  confirmed: number;
  cancelled: number;
}

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  receipt_number: string | null;
  paid_at: string | null;
  created_at: string;
  profiles?: { full_name?: string; student_id?: string } | null;
}

interface AuditRow {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles?: { full_name?: string } | null;
}

interface ReportsViewProps {
  enrollmentStats: EnrollmentStats;
  totalRevenue: number;
  revenueBreakdown: {
    tuition: number;
    registration: number;
    resource: number;
  };
  studentCount: number;
  paidPaymentCount: number;
  recentPayments: PaymentRow[];
  auditLogs: AuditRow[];
}

const ENROLLMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  paid: "bg-sky-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

export function ReportsView({
  enrollmentStats,
  totalRevenue,
  revenueBreakdown,
  studentCount,
  paidPaymentCount,
  recentPayments,
  auditLogs,
}: ReportsViewProps) {
  const enrollmentTotal = Object.values(enrollmentStats).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            sub: `${paidPaymentCount} paid transactions`,
            icon: CircleDollarSign,
            accent: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Students",
            value: studentCount,
            sub: "Registered accounts",
            icon: Users,
            accent: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-400",
          },
          {
            label: "Enrollments",
            value: enrollmentTotal,
            sub: "All time records",
            icon: ClipboardList,
            accent: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-400",
          },
          {
            label: "Audit Events",
            value: auditLogs.length,
            sub: "Recent activity shown",
            icon: Activity,
            accent: "from-orange-500/15 to-orange-500/5 text-orange-700 dark:text-orange-400",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="overflow-hidden border-0 shadow-md">
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 ${metric.accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Enrollment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(enrollmentStats).map(([status, count]) => {
              const pct = enrollmentTotal > 0 ? Math.round((count / enrollmentTotal) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <StatusBadge status={status} />
                      <span className="text-muted-foreground">{pct}%</span>
                    </span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${ENROLLMENT_COLORS[status] ?? "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {enrollmentTotal === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No enrollment data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              From {paidPaymentCount} successful payment{paidPaymentCount !== 1 ? "s" : ""}
            </p>
            <div className="mt-6 space-y-3 border-t pt-4">
              {[
                { label: "Tuition fees", amount: revenueBreakdown.tuition },
                { label: "Registration fees", amount: revenueBreakdown.registration },
                { label: "Resource fees", amount: revenueBreakdown.resource },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{formatCurrency(row.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-0 shadow-md lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {recentPayments.length > 0 ? (
              <TableScroll minWidth="40rem">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((p) => {
                      const student = p.profiles as {
                        full_name?: string;
                        student_id?: string;
                      } | null;
                      return (
                        <tr key={p.id} className="border-b border-border/50 last:border-0">
                          <td className="px-6 py-3">
                            <p className="font-medium">{student?.full_name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{student?.student_id}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {p.receipt_number ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.amount))}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {formatDate(p.paid_at ?? p.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableScroll>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No payments recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col border-0 shadow-md lg:col-span-2">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-lg">Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <div className="max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border bg-card/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(log.profiles as { full_name?: string })?.full_name ?? "System"} ·{" "}
                    {formatDateTime(log.created_at)}
                  </p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">No audit logs yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
