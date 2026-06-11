"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StaffOption {
  id: string;
  full_name: string;
  email: string;
}

interface LecturerSelectProps {
  staff: StaffOption[];
  value: string;
  onChange: (staffId: string) => void;
  placeholder?: string;
}

const NONE = "__none__";

export function resolveLecturerStaffId(lecturer: string | null | undefined, staff: StaffOption[]): string {
  if (!lecturer?.trim()) return NONE;

  const lower = lecturer.toLowerCase();
  const found = staff.find(
    (s) =>
      s.full_name.toLowerCase() === lower ||
      s.email.toLowerCase() === lower ||
      lower.includes(s.full_name.toLowerCase()) ||
      lower.includes(s.email.toLowerCase())
  );

  return found?.id ?? NONE;
}

export function staffIdToLecturerName(staffId: string, staff: StaffOption[]): string {
  if (!staffId || staffId === NONE) return "";
  return staff.find((s) => s.id === staffId)?.full_name ?? "";
}

export function LecturerSelect({ staff, value, onChange, placeholder = "Select lecturer" }: LecturerSelectProps) {
  return (
    <Select value={value || NONE} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        <SelectItem value={NONE}>No lecturer assigned</SelectItem>
        {staff.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.full_name} ({s.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
