"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FeeStructure, Programme, ProgrammeLevel } from "@/types/database";
import { FeeStructureEdit } from "@/components/admin/fee-structure-edit";
import { formatCurrency } from "@/lib/utils";
import { Search, CheckCircle2, AlertTriangle } from "lucide-react";

interface FeeWithProgramme extends FeeStructure {
  programmes?: Pick<Programme, "code" | "name" | "is_active" | "level">;
}

interface FeeStructuresListProps {
  fees: FeeWithProgramme[];
  currentSemester: string;
  outdatedCount?: number;
}

const LEVEL_RATE_HINT: Partial<Record<ProgrammeLevel, string>> = {
  foundation: "Default foundation: RM 120/credit",
  diploma: "Default diploma: RM 130/credit",
  bachelor: "Default bachelor: RM 150/credit",
  professional: "Default professional: RM 200/credit",
  postgraduate: "Default postgraduate: RM 180/credit",
};

const LEVEL_OPTIONS: { value: ProgrammeLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "foundation", label: "Foundation" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor" },
  { value: "professional", label: "Professional" },
  { value: "postgraduate", label: "Postgraduate" },
];

export function FeeStructuresList({
  fees,
  currentSemester,
  outdatedCount = 0,
}: FeeStructuresListProps) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return fees.filter((fee) => {
      const programme = fee.programmes;
      if (level !== "all" && programme?.level !== level) return false;
      if (!q) return true;
      return (
        programme?.code?.toLowerCase().includes(q) ||
        programme?.name?.toLowerCase().includes(q) ||
        fee.semester.toLowerCase().includes(q)
      );
    });
  }, [fees, search, level]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-xs dark:border-emerald-900 dark:bg-emerald-950/30">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-200">
              Showing fees for semester <span className="font-bold">{currentSemester}</span>{" "}
              (matches Academic Calendar)
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Rates vary by programme level. Edit per programme to override defaults.
            </p>
          </div>
        </div>

        {outdatedCount > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-xs dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-amber-900 dark:text-amber-200">
              {outdatedCount} programme(s) still on an older semester. Save Academic Calendar with a
              new semester to sync all fees automatically.
            </p>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by programme code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
        <Select value={level} onValueChange={(v) => setLevel(v as ProgrammeLevel | "all")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {fees.length} programmes
        </p>
      </div>

      <div className="min-h-0 max-h-[min(28rem,calc(100vh-18rem))] space-y-3 overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((fee) => (
            <div key={fee.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium">
                  {fee.programmes?.code} — {fee.programmes?.name}
                </p>
                {fee.programmes?.level && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                    {fee.programmes.level}
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-2">
                <span>Tuition: {formatCurrency(Number(fee.tuition_per_credit))}/credit</span>
                <span>Registration: {formatCurrency(Number(fee.registration_fee))}</span>
                <span>Resource: {formatCurrency(Number(fee.resource_fee))}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Semester: {fee.semester}
                {fee.programmes?.level && LEVEL_RATE_HINT[fee.programmes.level] && (
                  <span className="ml-2 text-muted-foreground/80">
                    · {LEVEL_RATE_HINT[fee.programmes.level]}
                  </span>
                )}
              </p>
              <FeeStructureEdit
                fee={fee}
                currentSemester={currentSemester}
                programmeLabel={`${fee.programmes?.code} — ${fee.programmes?.name}`}
              />
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No fee structures match your filter.
          </p>
        )}
      </div>
    </div>
  );
}
