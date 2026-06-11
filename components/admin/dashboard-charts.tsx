import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart as PieIcon, Users, TrendingUp } from "lucide-react";

interface EnrollmentStats {
  pending: number;
  paid: number;
  confirmed: number;
  cancelled: number;
}

interface RoleCounts {
  student: number;
  staff: number;
  lecturer: number;
  admin: number;
}

interface RevenueBreakdown {
  tuition: number;
  registration: number;
  resource: number;
}

interface DashboardChartsProps {
  enrollmentStats: EnrollmentStats;
  roleCounts: RoleCounts;
  revenueBreakdown: RevenueBreakdown;
  totalRevenue: number;
}

interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

const ENROLLMENT_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#0ea5e9",
  confirmed: "#10b981",
  cancelled: "#94a3b8",
};

const ROLE_COLORS: Record<string, string> = {
  Students: "#0ea5e9",
  Staff: "#10b981",
  Lecturers: "#f59e0b",
  Admins: "#8b5cf6",
};

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      No {label} data yet
    </div>
  );
}

function DonutChart({
  segments,
  total,
  centerLabel,
}: {
  segments: DonutSegment[];
  total: number;
  centerLabel: string;
}) {
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-[180px] w-[180px]" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dash = pct * circumference;
            const gap = Math.max(circumference - dash, 0);
            const el = (
              <circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <li key={seg.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label} ({seg.value})
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChartSimple({
  data,
}: {
  data: { name: string; amount: number }[];
}) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="space-y-4 px-2 pt-2">
      {data.map((row) => {
        const pct = Math.round((row.amount / max) * 100);
        return (
          <div key={row.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.name}</span>
              <span className="font-medium text-foreground">{formatCurrency(row.amount)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardCharts({
  enrollmentStats,
  roleCounts,
  revenueBreakdown,
  totalRevenue,
}: DashboardChartsProps) {
  const enrollmentSegments: DonutSegment[] = [
    { key: "pending", label: "Pending", value: enrollmentStats.pending, color: ENROLLMENT_COLORS.pending },
    { key: "paid", label: "Paid", value: enrollmentStats.paid, color: ENROLLMENT_COLORS.paid },
    { key: "confirmed", label: "Confirmed", value: enrollmentStats.confirmed, color: ENROLLMENT_COLORS.confirmed },
    { key: "cancelled", label: "Cancelled", value: enrollmentStats.cancelled, color: ENROLLMENT_COLORS.cancelled },
  ].filter((s) => s.value > 0);

  const roleSegments: DonutSegment[] = [
    { key: "students", label: "Students", value: roleCounts.student, color: ROLE_COLORS.Students },
    { key: "staff", label: "Staff", value: roleCounts.staff, color: ROLE_COLORS.Staff },
    { key: "lecturers", label: "Lecturers", value: roleCounts.lecturer, color: ROLE_COLORS.Lecturers },
    { key: "admins", label: "Admins", value: roleCounts.admin, color: ROLE_COLORS.Admins },
  ].filter((s) => s.value > 0);

  const revenueData = [
    { name: "Tuition", amount: revenueBreakdown.tuition },
    { name: "Registration", amount: revenueBreakdown.registration },
    { name: "Resource", amount: revenueBreakdown.resource },
  ];

  const enrollmentTotal = Object.values(enrollmentStats).reduce((s, n) => s + n, 0);
  const userTotal =
    roleCounts.student + roleCounts.staff + roleCounts.lecturer + roleCounts.admin;
  const hasRevenue = revenueData.some((d) => d.amount > 0);

  return (
    <div className="mb-8 grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            Enrollment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentSegments.length > 0 ? (
            <DonutChart segments={enrollmentSegments} total={enrollmentTotal} centerLabel="total" />
          ) : (
            <ChartEmpty label="enrollment" />
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Users by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roleSegments.length > 0 ? (
            <DonutChart segments={roleSegments} total={userTotal} centerLabel="users" />
          ) : (
            <ChartEmpty label="user" />
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasRevenue ? (
            <>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Total collected{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalRevenue)}
                </span>
              </p>
              <BarChartSimple data={revenueData} />
            </>
          ) : (
            <ChartEmpty label="revenue" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
