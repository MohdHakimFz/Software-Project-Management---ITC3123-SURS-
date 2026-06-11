"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/types/database";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  onError?: (message: string | null) => void;
}

export function UserRoleSelect({ userId, currentRole, onError }: UserRoleSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(currentRole);

  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  async function handleChange(newRole: string) {
    if (newRole === role) return;

    onError?.(null);
    setLoading(true);
    const previousRole = role;
    setRole(newRole as UserRole);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      const result = await res.json();

      if (!res.ok) {
        setRole(previousRole);
        onError?.(result.error ?? "Failed to update role.");
        return;
      }

      router.refresh();
    } catch {
      setRole(previousRole);
      onError?.("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={role} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-full min-w-[9rem] sm:w-[10.5rem]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="student">Student</SelectItem>
        <SelectItem value="staff">Staff (Registrar)</SelectItem>
        <SelectItem value="lecturer">Lecturer</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
