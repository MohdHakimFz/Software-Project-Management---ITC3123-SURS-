"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Check, ChevronRight, RotateCcw, Calendar, MapPin } from "lucide-react";

const DEMO_COURSES = [
  { code: "ITC312", name: "Software Project Management", credits: 3, seats: 12, lecturer: "Dr. Norazlina", day: "Thu", time: "9:00 AM", venue: "Room 201" },
  { code: "CYS201", name: "Cyber Security Fundamentals", credits: 3, seats: 8, lecturer: "Dr. Hafiz Rahman", day: "Wed", time: "2:00 PM", venue: "Lab 3" },
  { code: "ACC301", name: "Management Accounting", credits: 3, seats: 21, lecturer: "Dr. Farah Liyana", day: "Tue", time: "10:00 AM", venue: "Room 102" },
];

type DemoStep = "pick" | "fees" | "done";

export function RegistrationDemo() {
  const [step, setStep] = useState<DemoStep>("pick");
  const [selected, setSelected] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const course = selected !== null ? DEMO_COURSES[selected] : null;
  const tuition = course ? course.credits * 150 : 0;
  const total = tuition + 50 + 100;

  function handleSelect(index: number) {
    setSelected(index);
    setTimeout(() => setStep("fees"), 400);
  }

  function handlePay() {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStep("done");
    }, 1200);
  }

  function reset() {
    setStep("pick");
    setSelected(null);
    setIsPaying(false);
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Window chrome */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-uptm-blue/20 dark:shadow-black/40">
        <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-slate-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="ml-2 flex-1 text-center text-xs font-medium text-muted-foreground">
            surs.uptm.edu.my — student portal
          </span>
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="mb-5 flex items-center gap-1 text-xs font-medium">
            {(["Enroll", "Pay", "Done"] as const).map((label, i) => {
              const stepIndex = step === "pick" ? 0 : step === "fees" ? 1 : 2;
              const active = i <= stepIndex;
              return (
                <div key={label} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                      active ? "bg-uptm-blue text-white" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className={cn(active ? "text-uptm-blue dark:text-blue-300" : "text-muted-foreground")}>{label}</span>
                  {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                </div>
              );
            })}
          </div>

          {/* Step: pick course */}
          {step === "pick" && (
            <div className="space-y-2 animate-fade-in">
              <p className="mb-3 text-sm font-semibold text-foreground">Select a course to enroll</p>
              {DEMO_COURSES.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all duration-200",
                    "hover:border-uptm-blue hover:bg-uptm-blue/5 hover:shadow-md active:scale-[0.98]",
                    selected === i && "border-uptm-blue bg-uptm-blue/5 ring-2 ring-uptm-blue/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-uptm-blue dark:text-blue-300">{c.code}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      c.seats <= 10 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    )}>
                      {c.seats} seats left
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">{c.credits} credits · {c.lecturer}</p>
                </button>
              ))}
              <p className="pt-1 text-center text-[10px] text-muted-foreground">Click a course to try the flow</p>
            </div>
          )}

          {/* Step: fees */}
          {step === "fees" && course && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs font-bold text-uptm-blue dark:text-blue-300">{course.code}</p>
                <p className="text-sm text-foreground">{course.name}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tuition ({course.credits} × RM 150)</span>
                  <span>{formatCurrency(tuition)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Registration</span>
                  <span>{formatCurrency(50)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Resource</span>
                  <span>{formatCurrency(100)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold text-uptm-blue dark:text-blue-300">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaying}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
              >
                {isPaying ? "Processing..." : "Pay with Stripe →"}
              </button>
            </div>
          )}

          {/* Step: done */}
          {step === "done" && course && (
            <div className="animate-fade-in space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Enrollment Confirmed!</p>
                <p className="text-sm text-muted-foreground">{course.code} — payment received</p>
              </div>
              <div className="rounded-xl border border-dashed border-primary/30 bg-slate-50 p-3 text-left dark:bg-slate-900/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Your timetable slot</p>
                <p className="mt-1 text-sm font-medium text-foreground">{course.name}</p>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{course.day} {course.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{course.venue}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/50">
        ↑ Interactive preview — try clicking through
      </p>
    </div>
  );
}
