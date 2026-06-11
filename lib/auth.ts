import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, programmes(*, faculties(code, name))")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const profile = await requireAuth();
  if (!roles.includes(profile.role)) {
    redirect(getDashboardPath(profile.role));
  }
  return profile;
}

export function getDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    student: "/student/dashboard",
    staff: "/staff/dashboard",
    lecturer: "/lecturer/dashboard",
    admin: "/admin/dashboard",
  };
  return paths[role];
}
