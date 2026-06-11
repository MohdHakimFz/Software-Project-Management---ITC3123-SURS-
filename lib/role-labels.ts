import type { UserRole } from "@/types/database";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  staff: "Registrar Staff",
  lecturer: "Lecturer",
  admin: "Admin",
};

const PORTAL_LABELS: Record<UserRole, string> = {
  student: "Student Portal",
  staff: "Registrar Portal",
  lecturer: "Lecturer Portal",
  admin: "Admin Portal",
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function getPortalLabel(role: UserRole): string {
  return PORTAL_LABELS[role] ?? `${role} portal`;
}
