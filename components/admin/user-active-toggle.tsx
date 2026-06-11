"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UserActiveToggleProps {
  userId: string;
  isActive: boolean;
}

export function UserActiveToggle({ userId, isActive }: UserActiveToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, is_active: !isActive }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant={isActive ? "outline" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={!isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
    >
      {loading ? "..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
