import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

interface EnrollmentListItemProps {
  id: string;
  status: string;
  enrolledAt: string;
  studentName?: string | null;
  studentId?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  /** Staff layout shows student id + course on one line; admin splits course line */
  variant?: "staff" | "admin";
}

export function EnrollmentListItem({
  id,
  status,
  enrolledAt,
  studentName,
  studentId,
  courseCode,
  courseName,
  variant = "staff",
}: EnrollmentListItemProps) {
  return (
    <li
      key={id}
      className="flex flex-col gap-2 rounded-xl border bg-card/60 px-3 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4"
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium leading-snug">{studentName ?? "—"}</p>
        {variant === "staff" ? (
          <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
            {studentId && <span className="font-mono">{studentId}</span>}
            {courseCode && (
              <>
                {studentId && " · "}
                <span className="text-primary">{courseCode}</span>
                {courseName && <> — {courseName}</>}
              </>
            )}
          </p>
        ) : (
          <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
            {courseCode && (
              <>
                <span className="text-primary">{courseCode}</span>
                {courseName && <> — {courseName}</>}
              </>
            )}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {variant === "admin" && studentId ? (
            <>
              <span className="font-mono">{studentId}</span> · {formatDate(enrolledAt)}
            </>
          ) : (
            formatDate(enrolledAt)
          )}
        </p>
      </div>
      <StatusBadge status={status} className="w-fit shrink-0 self-start" />
    </li>
  );
}
