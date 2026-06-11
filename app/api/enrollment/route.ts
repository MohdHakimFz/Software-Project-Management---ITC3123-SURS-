import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEnrollmentCountForCourse } from "@/lib/enrollment-count";
import { wouldConflict } from "@/lib/timetable";
import { DAY_NAMES, type Timetable } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { course_id } = await request.json();
  if (!course_id) return NextResponse.json({ error: "Course ID required" }, { status: 400 });

  const { data: course } = await supabase
    .from("courses")
    .select("*, timetables(*)")
    .eq("id", course_id)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!course.is_active) {
    return NextResponse.json({ error: "This course is no longer available" }, { status: 400 });
  }
  const currentEnrollment = await getEnrollmentCountForCourse(supabase, course_id);
  if (currentEnrollment >= course.capacity) {
    return NextResponse.json({ error: "Course is full" }, { status: 400 });
  }
  if (course.enrollment_deadline && new Date() > new Date(course.enrollment_deadline)) {
    return NextResponse.json({ error: "Enrollment deadline has passed" }, { status: 400 });
  }

  const { data: calendarConfig } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "academic_calendar")
    .maybeSingle();

  const calendar = calendarConfig?.value as { registration_open?: boolean } | undefined;
  if (calendar?.registration_open === false) {
    return NextResponse.json({ error: "Registration is currently closed" }, { status: 400 });
  }

  const { data: existingEnrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses(timetables(*))")
    .eq("student_id", user.id)
    .in("status", ["pending", "paid", "confirmed"]);

  const existingTimetables: Timetable[] = [];
  existingEnrollments?.forEach((e) => {
    const timetables = (e.courses as { timetables?: Timetable[] })?.timetables ?? [];
    existingTimetables.push(...timetables);
  });

  const newTimetables = (course.timetables ?? []) as Timetable[];

  // Allow enrollment when schedule not published yet — lecturer/staff can set timetable later
  if (newTimetables.length > 0 && existingTimetables.length > 0) {
    for (const slot of newTimetables) {
      const conflict = existingTimetables.find((existing) => wouldConflict([existing], slot));
      if (conflict) {
        const day = DAY_NAMES[slot.day_of_week] ?? "Unknown day";
        return NextResponse.json(
          {
            error: `Schedule conflict on ${day} (${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}) with one of your enrolled courses. Drop the conflicting course or choose another section.`,
          },
          { status: 400 }
        );
      }
    }
  }

  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .insert({
      student_id: user.id,
      course_id,
      status: "pending",
      semester: course.semester,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrollment });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollment_id } = await request.json();

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "cancelled" })
    .eq("id", enrollment_id)
    .eq("student_id", user.id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
