"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { UserProgrammeSelect } from "@/components/admin/user-programme-select";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Programme, Profile, UserRole } from "@/types/database";
import { Search } from "lucide-react";

interface UserRow extends Omit<Profile, "programmes"> {
  programmes?: { code?: string } | null;
}

interface UsersListProps {
  users: UserRow[];
  programmes: Programme[];
}

export function UsersList({ users, programmes }: UsersListProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.student_id?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="lecturer">Lecturer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {users.length} users
      </p>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {actionError}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.student_id && (
                <p className="text-xs text-muted-foreground">{user.student_id}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={user.is_active ? "confirmed" : "cancelled"} />
              {user.role === "student" && (
                <UserProgrammeSelect
                  userId={user.id}
                  currentProgrammeId={user.programme_id}
                  programmes={programmes}
                />
              )}
              <UserRoleSelect
                userId={user.id}
                currentRole={user.role as UserRole}
                onError={setActionError}
              />
              <UserActiveToggle userId={user.id} isActive={user.is_active} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
