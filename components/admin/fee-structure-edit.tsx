"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FeeStructure } from "@/types/database";
import { Pencil, X, Check, Loader2 } from "lucide-react";

interface FeeStructureEditProps {
  fee: FeeStructure;
  programmeLabel: string;
  currentSemester: string;
}

export function FeeStructureEdit({ fee, programmeLabel, currentSemester }: FeeStructureEditProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    tuition_per_credit: String(fee.tuition_per_credit),
    registration_fee: String(fee.registration_fee),
    resource_fee: String(fee.resource_fee),
    semester: fee.semester,
  });

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fee-structures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: fee.id,
          ...form,
          semester: form.semester || currentSemester,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Failed to save fee structure.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="mr-1.5 h-3.5 w-3.5" />
        Edit
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="text-xs font-medium text-primary">Editing {programmeLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Tuition / credit (RM)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.tuition_per_credit}
            onChange={(e) => setForm((f) => ({ ...f, tuition_per_credit: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Registration (RM)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.registration_fee}
            onChange={(e) => setForm((f) => ({ ...f, registration_fee: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Resource (RM)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.resource_fee}
            onChange={(e) => setForm((f) => ({ ...f, resource_fee: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Semester</Label>
          <Input
            value={form.semester}
            onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          <X className="mr-1 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
