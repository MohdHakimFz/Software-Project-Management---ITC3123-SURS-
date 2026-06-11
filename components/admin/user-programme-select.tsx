"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Programme } from "@/types/database";

interface UserProgrammeSelectProps {
  userId: string;
  currentProgrammeId: string | null;
  programmes: Programme[];
}

export function UserProgrammeSelect({
  userId,
  currentProgrammeId,
  programmes,
}: UserProgrammeSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(programmeId: string) {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        programme_id: programmeId === "none" ? null : programmeId,
      }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Select
      value={currentProgrammeId ?? "none"}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="h-8 w-44 text-xs">
        <SelectValue placeholder="Programme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No programme</SelectItem>
        {programmes.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
