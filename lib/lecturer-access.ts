import type { Course, Profile } from "@/types/database";
import { isLecturerForCourse } from "@/lib/lecturer";

export function canLecturerAccessCourse(
  profile: Pick<Profile, "role" | "full_name" | "email">,
  course: Pick<Course, "lecturer">
): boolean {
  if (profile.role === "admin" || profile.role === "staff") return true;
  if (profile.role === "lecturer") return isLecturerForCourse(course, profile);
  return false;
}
