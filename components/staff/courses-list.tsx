"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker, toISODateString } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  LecturerSelect,
  resolveLecturerStaffId,
  staffIdToLecturerName,
  type StaffOption,
} from "@/components/staff/lecturer-select";
import type { Course } from "@/types/database";
import { Pencil, Users, Loader2, Ban, Check, Search, Trash2, Calendar } from "lucide-react";

type StatusFilter = "all" | "active" | "inactive";

interface CourseRow extends Omit<Course, "programmes"> {
  programmes?: { code?: string; name?: string };
}

interface CoursesListProps {
  courses: CourseRow[];
  staff?: StaffOption[];
  showRosterLink?: boolean;
  showDelete?: boolean;
  rosterSource?: "courses" | "my-courses";
  /** manage = registrar (edit/deactivate); teach = lecturer (roster + timetable only) */
  variant?: "manage" | "teach";
  portalPath?: "/staff" | "/lecturer";
}

export function CoursesList({
  courses,
  staff = [],
  showRosterLink = true,
  showDelete = false,
  rosterSource = "courses",
  variant = "manage",
  portalPath = "/staff",
}: CoursesListProps) {
  const canManage = variant === "manage";
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    credit_hours: "",
    capacity: "",
    lecturer_id: "__none__",
    enrollment_deadline: "",
  });

  function startEdit(course: CourseRow) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      description: course.description ?? "",
      credit_hours: String(course.credit_hours),
      capacity: String(course.capacity),
      lecturer_id: resolveLecturerStaffId(course.lecturer, staff),
      enrollment_deadline: course.enrollment_deadline?.slice(0, 10) ?? "",
    });
  }

  async function saveEdit(id: string) {
    setLoading(true);
    await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: form.name,
        description: form.description,
        credit_hours: form.credit_hours,
        capacity: form.capacity,
        enrollment_deadline: form.enrollment_deadline,
        lecturer: staffIdToLecturerName(form.lecturer_id, staff),
      }),
    });
    setLoading(false);
    setEditingId(null);
    router.refresh();
  }

  const programmeOptions = useMemo(() => {
    const codes = new Set<string>();
    courses.forEach((c) => {
      const code = c.programmes?.code;
      if (code) codes.add(code);
    });
    return Array.from(codes).sort();
  }, [courses]);

  const semesterOptions = useMemo(() => {
    const semesters = new Set(courses.map((c) => c.semester).filter(Boolean));
    return Array.from(semesters).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter((course) => {
      if (statusFilter === "active" && !course.is_active) return false;
      if (statusFilter === "inactive" && course.is_active) return false;
      if (programmeFilter !== "all" && course.programmes?.code !== programmeFilter) return false;
      if (semesterFilter !== "all" && course.semester !== semesterFilter) return false;
      if (!q) return true;
      const haystack = [
        course.code,
        course.name,
        course.lecturer,
        course.programmes?.code,
        course.programmes?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [courses, search, statusFilter, programmeFilter, semesterFilter]);

  async function toggleActive(id: string, isActive: boolean) {
    setActionError(null);
    setLoading(true);
    await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteCourse(course: CourseRow) {
    const confirmed = window.confirm(
      `Delete "${course.code} — ${course.name}"?\n\nThis cannot be undone. Timetable slots and enrollments will be removed.`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(course.id);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.error ?? "Failed to delete course.");
        return;
      }
      if (editingId === course.id) setEditingId(null);
      router.refresh();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative z-10 space-y-3 rounded-xl border bg-muted/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, lecturer, or programme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background pl-10"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Programme" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All programmes</SelectItem>
              {programmeOptions.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All semesters</SelectItem>
              {semesterOptions.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing {filteredCourses.length} of {courses.length} courses
          </span>
          {(search || statusFilter !== "all" || programmeFilter !== "all" || semesterFilter !== "all") && (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setProgrammeFilter("all");
                setSemesterFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {actionError}
        </p>
      )}

      <div className="max-h-[min(32rem,70vh)] space-y-3 overflow-y-auto pr-1">
        {filteredCourses.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            No courses match your search or filters.
          </div>
        ) : (
          filteredCourses.map((course) => (
        <div key={course.id} className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">
                {course.code} — {course.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {course.programmes?.code} · {course.credit_hours} credits · {course.lecturer ?? "No lecturer"}
              </p>
              <p className="text-xs text-muted-foreground">
                {course.enrolled_count}/{course.capacity} enrolled · {course.semester}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={course.is_active ? "confirmed" : "cancelled"} />
              {showRosterLink && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={
                        rosterSource === "courses"
                          ? `${portalPath}/my-courses/${course.id}/timetable?from=courses`
                          : `${portalPath}/my-courses/${course.id}/timetable`
                      }
                    >
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      Timetable
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={
                        rosterSource === "courses"
                          ? `${portalPath}/my-courses/${course.id}?from=courses`
                          : `${portalPath}/my-courses/${course.id}`
                      }
                    >
                      <Users className="mr-1 h-3.5 w-3.5" />
                      Roster
                    </Link>
                  </Button>
                </>
              )}
              {canManage && (
                <Button variant="outline" size="sm" onClick={() => startEdit(course)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(course.id, course.is_active)}
                  disabled={loading || deletingId === course.id}
                >
                  {course.is_active ? (
                    <>
                      <Ban className="mr-1 h-3.5 w-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Activate
                    </>
                  )}
                </Button>
              )}
              {canManage && showDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                  onClick={() => deleteCourse(course)}
                  disabled={loading || deletingId === course.id}
                >
                  {deletingId === course.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {canManage && editingId === course.id && (
            <div className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-muted/30 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Course name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lecturer</Label>
                  <LecturerSelect
                    staff={staff}
                    value={form.lecturer_id}
                    onChange={(v) => setForm((f) => ({ ...f, lecturer_id: v }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Credit hours</Label>
                  <Input
                    type="number"
                    value={form.credit_hours}
                    onChange={(e) => setForm((f) => ({ ...f, credit_hours: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Capacity</Label>
                  <Input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Enrollment deadline</Label>
                  <DatePicker
                    value={form.enrollment_deadline}
                    onChange={(enrollment_deadline) =>
                      setForm((f) => ({ ...f, enrollment_deadline }))
                    }
                    min={toISODateString(new Date())}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(course.id)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
          ))
        )}
      </div>
    </div>
  );
}
