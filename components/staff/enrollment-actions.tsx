"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface StaffEnrollmentActionsProps {
  enrollmentId: string;
}

export function StaffEnrollmentActions({ enrollmentId }: StaffEnrollmentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    setLoading(true);
    await fetch("/api/enrollment/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollment_id: enrollmentId, action }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" onClick={() => handleAction("approve")} disabled={loading}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("reject")} disabled={loading}>
        Reject
      </Button>
    </div>
  );
}
