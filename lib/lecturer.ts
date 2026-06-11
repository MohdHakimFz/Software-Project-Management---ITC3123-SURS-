import type { Course, Profile } from "@/types/database";

/** Match courses where lecturer field references this staff user (name or email). */
export function isLecturerForCourse(course: Pick<Course, "lecturer">, profile: Pick<Profile, "full_name" | "email">): boolean {
  if (!course.lecturer?.trim()) return false;

  const lecturer = course.lecturer.toLowerCase();
  const name = profile.full_name.toLowerCase();
  const email = profile.email.toLowerCase();
  const emailLocal = email.split("@")[0];

  return (
    lecturer.includes(name) ||
    lecturer.includes(email) ||
    name.includes(lecturer) ||
    emailLocal.includes(lecturer.replace(/\s/g, "")) ||
    lecturer.includes(emailLocal)
  );
}

export function filterMyCourses<T extends Pick<Course, "lecturer">>(
  courses: T[],
  profile: Pick<Profile, "full_name" | "email" | "role">
): T[] {
  if (profile.role === "admin") return courses;
  if (profile.role === "lecturer") {
    return courses.filter((c) => isLecturerForCourse(c, profile));
  }
  return [];
}
