"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Course, Enrollment } from "@/types/database";
import { courseTuitionFee } from "@/lib/fees";
import { Users, Clock, User, Loader2, CheckCircle2, Banknote } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  tuitionPerCredit?: number;
  onEnroll?: (courseId: string) => void;
  onDrop?: (enrollmentId: string) => void;
  loading?: boolean;
}

export function CourseCard({
  course,
  enrollment,
  tuitionPerCredit,
  onEnroll,
  onDrop,
  loading,
}: CourseCardProps) {
  const tuitionFee =
    tuitionPerCredit != null ? courseTuitionFee(course.credit_hours, tuitionPerCredit) : null;
  const seatsLeft = course.capacity - course.enrolled_count;
  const isFull = seatsLeft <= 0;
  const isEnrolled = !!enrollment && enrollment.status !== "cancelled";
  const fillPercent = Math.min(100, (course.enrolled_count / course.capacity) * 100);
  const isAlmostFull = seatsLeft <= 5 && seatsLeft > 0;

  return (
    <div className="interactive-card group flex flex-col overflow-hidden">
      <div className="border-b bg-gradient-to-r from-uptm-blue/5 to-transparent p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {course.code}
            </span>
            <h3 className="mt-2 text-base font-semibold leading-snug text-uptm-blue group-hover:text-uptm-blue/80 dark:text-foreground">
              {course.name}
            </h3>
          </div>
          {enrollment && <StatusBadge status={enrollment.status} />}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {course.description && (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            {course.credit_hours} credits
          </span>
          {course.lecturer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <User className="h-3 w-3" />
              {course.lecturer}
            </span>
          )}
        </div>

        {tuitionFee != null && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <Banknote className="h-3.5 w-3.5" />
                Tuition fee
              </span>
              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {formatCurrency(tuitionFee)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {course.credit_hours} credits × {formatCurrency(tuitionPerCredit!)}/credit
              {" · "}registration & resource fees added at checkout
            </p>
          </div>
        )}

        {/* Seat availability bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              Seats available
            </span>
            <span className={cn(
              "font-semibold",
              isFull ? "text-red-600" : isAlmostFull ? "text-orange-600" : "text-emerald-600"
            )}>
              {seatsLeft} / {course.capacity}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFull ? "bg-red-500" : isAlmostFull ? "bg-orange-500" : "bg-emerald-500"
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto">
          {isEnrolled ? (
            enrollment?.status === "pending" && onDrop ? (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onDrop(enrollment.id)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Enrollment"}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="w-full gap-2" disabled>
                <CheckCircle2 className="h-4 w-4" />
                Enrolled
              </Button>
            )
          ) : (
            <Button
              size="sm"
              className="w-full transition-all hover:shadow-md hover:shadow-uptm-blue/20"
              onClick={() => onEnroll?.(course.id)}
              disabled={isFull || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFull ? (
                "Course Full"
              ) : (
                "Enroll Now"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
