"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker, toISODateString } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LecturerSelect,
  staffIdToLecturerName,
  type StaffOption,
} from "@/components/staff/lecturer-select";
import { useToast } from "@/components/providers/toast-provider";
import type { Programme } from "@/types/database";

interface CourseFormProps {
  programmes: Programme[];
  staff: StaffOption[];
}

export function CourseForm({ programmes, staff }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    programme_id: "",
    credit_hours: "3",
    capacity: "40",
    lecturer_id: "__none__",
    semester: "2026/1",
    enrollment_deadline: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.programme_id) {
      setError("Please select a programme.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description,
          programme_id: form.programme_id,
          credit_hours: form.credit_hours,
          capacity: form.capacity,
          semester: form.semester,
          enrollment_deadline: form.enrollment_deadline || undefined,
          lecturer: staffIdToLecturerName(form.lecturer_id, staff) || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Failed to add course.");
        return;
      }

      const addedCode = form.code.trim();
      setForm({
        code: "",
        name: "",
        description: "",
        programme_id: "",
        credit_hours: "3",
        capacity: "40",
        lecturer_id: "__none__",
        semester: "2026/1",
        enrollment_deadline: "",
      });
      toast({ title: "Course added", description: `${addedCode} is now available for enrollment.` });
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Course Code</Label>
          <Input value={form.code} onChange={(e) => update("code", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Course Name</Label>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Programme *</Label>
          <Select
            value={form.programme_id || undefined}
            onValueChange={(v) => update("programme_id", v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select programme (required)" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {programmes.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Lecturer</Label>
          <LecturerSelect
            staff={staff}
            value={form.lecturer_id}
            onChange={(v) => update("lecturer_id", v)}
          />
          {staff.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No lecturer accounts found. Add lecturer users in Admin → Users first.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Credit Hours</Label>
          <Input type="number" value={form.credit_hours} onChange={(e) => update("credit_hours", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Capacity</Label>
          <Input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enrollment_deadline">Enrollment Deadline</Label>
          <DatePicker
            id="enrollment_deadline"
            value={form.enrollment_deadline}
            onChange={(enrollment_deadline) => update("enrollment_deadline", enrollment_deadline)}
            min={toISODateString(new Date())}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => update("description", e.target.value)} />
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading || !form.programme_id}>
        {loading ? "Adding..." : "Add Course"}
      </Button>
    </form>
  );
}
