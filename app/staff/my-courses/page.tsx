import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function StaffMyCoursesPage() {
  const profile = await requireRole(["staff", "admin"]);
  if (profile.role === "staff") {
    redirect("/staff/courses");
  }
  redirect("/lecturer/my-courses");
}
