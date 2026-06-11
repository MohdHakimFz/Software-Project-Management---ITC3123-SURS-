"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { StaffEnrollmentActions } from "@/components/staff/enrollment-actions";
import { formatDate } from "@/lib/utils";
import type { EnrollmentStatus } from "@/types/database";
import { Search } from "lucide-react";

interface EnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  courses?: { code?: string; name?: string };
  profiles?: { full_name?: string; student_id?: string };
}

interface EnrollmentsListProps {
  enrollments: EnrollmentRow[];
}

const STATUS_OPTIONS: { value: EnrollmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EnrollmentsList({ enrollments }: EnrollmentsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enrollments.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (!q) return true;
      const name = e.profiles?.full_name?.toLowerCase() ?? "";
      const sid = e.profiles?.student_id?.toLowerCase() ?? "";
      const code = e.courses?.code?.toLowerCase() ?? "";
      const cname = e.courses?.name?.toLowerCase() ?? "";
      return name.includes(q) || sid.includes(q) || code.includes(q) || cname.includes(q);
    });
  }, [enrollments, search, status]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search student or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={status} onValueChange={(v) => setStatus(v as EnrollmentStatus | "all")}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {enrollments.length}
      </p>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto">
        {filtered.map((e) => (
          <div key={e.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{e.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground">{e.profiles?.student_id}</p>
                <p className="mt-1 text-sm">
                  {e.courses?.code} — {e.courses?.name}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(e.enrolled_at)}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
            {e.status === "pending" && <StaffEnrollmentActions enrollmentId={e.id} />}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No enrollments match.</p>
        )}
      </div>
    </div>
  );
}
