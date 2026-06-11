"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  min?: string;
  max?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  const x = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const y = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return x.getTime() < y.getTime();
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  id,
  className,
  min,
  max,
}: DatePickerProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = parseISODate(value);
  const minDate = parseISODate(min ?? "");
  const maxDate = parseISODate(max ?? "");

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected ?? new Date());

  useEffect(() => {
    const parsed = parseISODate(value);
    if (parsed) setView(parsed);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const items: { date: Date; inMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      items.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push({ date: new Date(year, month, day), inMonth: true });
    }
    while (items.length < 42) {
      const nextDay = items.length - firstDay - daysInMonth + 1;
      items.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
    }

    return items;
  }, [view]);

  const today = new Date();

  function isDisabled(date: Date): boolean {
    if (minDate && isBeforeDay(date, minDate)) return true;
    if (maxDate && isBeforeDay(maxDate, date)) return true;
    return false;
  }

  function selectDate(date: Date) {
    if (isDisabled(date)) return;
    onChange(toISODateString(date));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setView((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-base ring-offset-background transition-colors",
          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-input md:h-10 md:text-sm",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{value ? formatDate(value) : placeholder}</span>
        <Calendar className="h-4 w-4 shrink-0 text-primary" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="date-picker-popover absolute left-0 right-0 z-[200] mt-2 w-full min-w-[280px] rounded-xl border border-border bg-card p-4 shadow-xl shadow-uptm-blue/10 dark:shadow-black/40 sm:min-w-[300px]"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-foreground">
                {MONTHS[view.getMonth()]} {view.getFullYear()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pick a date</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ date, inMonth }) => {
              const iso = toISODateString(date);
              const isSelected = selected ? isSameDay(date, selected) : false;
              const isToday = isSameDay(date, today);
              const off = isDisabled(date);

              return (
                <button
                  key={iso + (inMonth ? "" : "-pad")}
                  type="button"
                  disabled={off}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all sm:h-9",
                    !inMonth && "text-muted-foreground/40",
                    inMonth && !isSelected && !off && "text-foreground hover:bg-muted",
                    isToday && !isSelected && "ring-1 ring-primary/30",
                    isSelected && "bg-primary text-primary-foreground shadow-md shadow-primary/25",
                    off && "cursor-not-allowed opacity-30"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => selectDate(today)}
              disabled={isDisabled(today)}
            >
              Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
