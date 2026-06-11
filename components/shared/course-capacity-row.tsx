interface CourseCapacityRowProps {
  code: string;
  name: string;
  enrolledCount: number;
  capacity: number;
  lecturer?: string | null;
  showMeta?: boolean;
}

export function CourseCapacityRow({
  code,
  name,
  enrolledCount,
  capacity,
  lecturer,
  showMeta = false,
}: CourseCapacityRowProps) {
  const pct =
    capacity > 0 ? Math.min(Math.round((enrolledCount / capacity) * 100), 100) : 0;
  const seatsLeft = Math.max(capacity - enrolledCount, 0);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-primary">{code}</span>
          <p className="break-words text-sm leading-snug text-foreground">{name}</p>
          {lecturer && (
            <p className="mt-0.5 break-words text-xs text-muted-foreground">{lecturer}</p>
          )}
        </div>
        <span className="w-fit shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground">
          {enrolledCount}/{capacity}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 90 ? "bg-amber-500" : pct >= 70 ? "bg-sky-500" : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showMeta && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {pct}% full · {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left
        </p>
      )}
    </div>
  );
}
