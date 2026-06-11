"use client";

import { useEffect, useState } from "react";

function getDaysLeft() {
  const deadline = new Date("2026-06-30T23:59:59");
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function CountdownBanner() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(getDaysLeft());
  }, []);

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-blue-400/25 bg-blue-500/10 px-4 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
      </span>
      <span className="text-sm text-white/90" suppressHydrationWarning>
        <strong className="text-blue-200">{days ?? "—"} days</strong> left to enroll — Sem 2026/1
      </span>
    </div>
  );
}
