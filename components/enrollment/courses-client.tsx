"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/enrollment/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import type { Course, Enrollment } from "@/types/database";

interface CoursesClientProps {
  courses: Course[];
  enrollments: Enrollment[];
  studentId: string;
  programmeCode?: string;
  programmeName?: string;
  tuitionPerCredit?: number;
}

export function CoursesClient({
  courses,
  enrollments,
  programmeCode,
  programmeName,
  tuitionPerCredit,
}: CoursesClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.lecturer?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  function getEnrollment(courseId: string) {
    return enrollments.find((e) => e.course_id === courseId && e.status !== "cancelled");
  }

  async function handleEnroll(courseId: string) {
    setError(null);
    setLoading(courseId);
    try {
      const res = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Enrollment failed. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDrop(enrollmentId: string) {
    setLoading(enrollmentId);
    await fetch("/api/enrollment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollment_id: enrollmentId }),
    });
    router.refresh();
    setLoading(null);
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses available"
        description="There are no courses for your programme this semester. Please contact the registrar."
      />
    );
  }

  return (
    <div>
      {programmeName && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 dark:border-sky-900 dark:bg-sky-950/30">
          <p className="text-sm text-muted-foreground">
            Showing courses for your programme
          </p>
          <p className="font-semibold text-foreground">
            {programmeCode ? `${programmeCode} — ` : ""}
            {programmeName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {courses.length} course{courses.length === 1 ? "" : "s"} available this semester for
            your registered programme. Contact admin to request a programme change.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by code, name, or lecturer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10 shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description={`No courses match "${search}". Try a different search term.`}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={getEnrollment(course.id)}
              tuitionPerCredit={tuitionPerCredit}
              onEnroll={handleEnroll}
              onDrop={handleDrop}
              loading={loading === course.id || loading === getEnrollment(course.id)?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
