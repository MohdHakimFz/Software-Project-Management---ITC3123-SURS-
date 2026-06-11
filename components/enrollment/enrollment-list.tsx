"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Course, Enrollment } from "@/types/database";
import { Loader2 } from "lucide-react";

interface EnrollmentWithCourse extends Omit<Enrollment, "courses"> {
  courses?: Course | { code?: string; name?: string; credit_hours?: number; lecturer?: string };
}

interface EnrollmentListProps {
  pending: EnrollmentWithCourse[];
  confirmed: EnrollmentWithCourse[];
}

export function EnrollmentList({ pending, confirmed }: EnrollmentListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCancel(enrollmentId: string) {
    setError("");
    setLoadingId(enrollmentId);

    const res = await fetch("/api/enrollment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollment_id: enrollmentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to cancel enrollment");
      setLoadingId(null);
      return;
    }

    setLoadingId(null);
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-card shadow-sm dark:border-sky-900">
          <div className="flex flex-row items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Pending Payment ({pending.length})</h2>
            <Button asChild size="sm">
              <Link href="/student/fees">Pay Now</Link>
            </Button>
          </div>
          <div className="space-y-3 p-6">
            {pending.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {(e.courses as { code?: string })?.code} — {(e.courses as { name?: string })?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enrolled {formatDate(e.enrolled_at)} ·{" "}
                    {(e.courses as { credit_hours?: number })?.credit_hours} credits
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                    onClick={() => handleCancel(e.id)}
                    disabled={loadingId === e.id}
                  >
                    {loadingId === e.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Cancel Enrollment"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Confirmed Enrollments ({confirmed.length})</h2>
        </div>
        <div className="p-6">
          {confirmed.length > 0 ? (
            <div className="space-y-3">
              {confirmed.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {(e.courses as { code?: string })?.code} — {(e.courses as { name?: string })?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(e.courses as { lecturer?: string })?.lecturer}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No confirmed enrollments yet.{" "}
              <Link href="/student/courses" className="text-primary hover:underline">
                Browse courses
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
