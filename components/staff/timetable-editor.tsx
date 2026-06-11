"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAY_NAMES, type Timetable } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { AlertTriangle, Calendar, Clock, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

interface TimetableEditorProps {
  courseId: string;
  courseCode: string;
  enrolledCount: number;
  initialSlots: Timetable[];
}

function toInputTime(time: string): string {
  return time.slice(0, 5);
}

const emptyForm = {
  day_of_week: "1",
  start_time: "09:00",
  end_time: "12:00",
  venue: "",
};

export function TimetableEditor({
  courseId,
  courseCode,
  enrolledCount,
  initialSlots,
}: TimetableEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(slot: Timetable) {
    setEditingId(slot.id);
    setForm({
      day_of_week: String(slot.day_of_week),
      start_time: toInputTime(slot.start_time),
      end_time: toInputTime(slot.end_time),
      venue: slot.venue,
    });
    setError(null);
  }

  async function saveSlot() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        venue: form.venue.trim(),
      };

      const res = await fetch("/api/admin/timetables", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : { course_id: courseId, ...payload }
        ),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Failed to save timetable slot.");
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSlot(slot: Timetable) {
    const confirmed = window.confirm(
      `Remove ${DAY_NAMES[slot.day_of_week]} ${formatTime(slot.start_time)}–${formatTime(slot.end_time)} at ${slot.venue}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/timetables", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Failed to delete slot.");
        return;
      }
      if (editingId === slot.id) resetForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {enrolledCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-amber-900 dark:text-amber-200">
            <span className="font-medium">{enrolledCount} student(s)</span> enrolled in {courseCode}.
            Timetable changes apply immediately on their schedule view.
          </p>
        </div>
      )}

      {initialSlots.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          <Calendar className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No class slots yet. Add day, time, and venue below.
        </div>
      ) : (
        <div className="space-y-2">
          {initialSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{DAY_NAMES[slot.day_of_week]}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {slot.venue}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(slot)} disabled={loading}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:text-red-400"
                  onClick={() => deleteSlot(slot)}
                  disabled={loading}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="mb-3 text-sm font-medium">
          {editingId ? "Edit class slot" : "Add class slot"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Day</Label>
            <Select value={form.day_of_week} onValueChange={(v) => setForm((f) => ({ ...f, day_of_week: v }))}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {DAY_NAMES.map((day, index) => (
                  <SelectItem key={day} value={String(index)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Start time</Label>
            <Input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End time</Label>
            <Input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Venue</Label>
            <Input
              placeholder="e.g. Lab 2, Room 301"
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              className="bg-background"
            />
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={saveSlot} disabled={loading || !form.venue.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              "Save changes"
            ) : (
              <>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add slot
              </>
            )}
          </Button>
          {editingId && (
            <Button size="sm" variant="ghost" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
