"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/providers/toast-provider";

interface ConfigItem {
  key: string;
  value: Record<string, unknown>;
}

interface ConfigFormProps {
  config: ConfigItem[];
}

export function ConfigForm({ config }: ConfigFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const calendar = config.find((c) => c.key === "academic_calendar")?.value as {
    semester?: string;
    start_date?: string;
    end_date?: string;
    registration_open?: boolean;
  } | undefined;

  const [form, setForm] = useState({
    semester: calendar?.semester ?? "2026/1",
    start_date: calendar?.start_date ?? "",
    end_date: calendar?.end_date ?? "",
    registration_open: calendar?.registration_open ?? true,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast({ title: "Save failed", description: "Could not update configuration.", variant: "error" });
        return;
      }
      toast({ title: "Configuration saved", description: "Academic calendar updated." });
      router.refresh();
    } catch {
      toast({ title: "Save failed", description: "Network error. Try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Semester</Label>
        <Input value={form.semester} onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <DatePicker
          id="start_date"
          value={form.start_date}
          onChange={(start_date) => setForm((p) => ({ ...p, start_date }))}
          max={form.end_date || undefined}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <DatePicker
          id="end_date"
          value={form.end_date}
          onChange={(end_date) => setForm((p) => ({ ...p, end_date }))}
          min={form.start_date || undefined}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="registration_open"
          checked={form.registration_open}
          onChange={(e) => setForm((p) => ({ ...p, registration_open: e.target.checked }))}
        />
        <Label htmlFor="registration_open">Registration Open</Label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Configuration"}</Button>
    </form>
  );
}
