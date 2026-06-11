import type { SupabaseClient } from "@supabase/supabase-js";

const ACTIVE_STATUSES = ["pending", "paid", "confirmed"] as const;

/** Live enrollment counts per course (source of truth for display & capacity). */
export async function getEnrollmentCountsByCourse(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_enrollment_counts");

  if (!rpcError && rpcData) {
    const counts: Record<string, number> = {};
    for (const row of rpcData as { course_id: string; enrollment_count: number }[]) {
      counts[row.course_id] = row.enrollment_count;
    }
    return counts;
  }

  // Fallback if migration not applied yet (staff/admin see all rows; students see partial)
  const { data } = await supabase
    .from("enrollments")
    .select("course_id")
    .in("status", [...ACTIVE_STATUSES]);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.course_id] = (counts[row.course_id] ?? 0) + 1;
  }
  return counts;
}

export async function getEnrollmentCountForCourse(
  supabase: SupabaseClient,
  courseId: string
): Promise<number> {
  const counts = await getEnrollmentCountsByCourse(supabase);
  return counts[courseId] ?? 0;
}

export function mergeEnrollmentCounts<T extends { id: string; enrolled_count: number }>(
  courses: T[],
  counts: Record<string, number>
): T[] {
  return courses.map((course) => ({
    ...course,
    enrolled_count: counts[course.id] ?? course.enrolled_count,
  }));
}
