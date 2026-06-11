"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, UserCog, ShieldCheck, BookMarked } from "lucide-react";

const ROLES = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    items: ["Browse & enroll in courses", "Pay semester fees online", "View auto-generated timetable", "Track enrollment status"],
  },
  {
    id: "staff",
    label: "Staff",
    icon: UserCog,
    items: ["Approve enrollment requests", "Manage course listings", "Set timetables & deadlines", "Monitor student enrollments"],
  },
  {
    id: "lecturer",
    label: "Lecturer",
    icon: BookMarked,
    items: ["View assigned courses only", "See class roster", "Set class timetable", "No registrar admin access"],
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    items: ["Manage user roles", "Configure fee structures", "Export reports (CSV)", "View system audit logs"],
  },
];

export function RoleTabs() {
  const [active, setActive] = useState("student");
  const current = ROLES.find((r) => r.id === active)!;

  return (
    <div>
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 snap-x snap-mandatory touch-pan-x">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setActive(role.id)}
            className={cn(
              "flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] sm:px-5",
              active === role.id
                ? "bg-uptm-blue text-white shadow-lg shadow-uptm-blue/25"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            <role.icon className="h-4 w-4" />
            {role.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300">
        <ul className="grid gap-3 sm:grid-cols-2">
          {current.items.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl bg-muted px-4 py-3 text-sm text-foreground animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
