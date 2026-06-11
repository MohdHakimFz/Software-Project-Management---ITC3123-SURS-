import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canLecturerAccessCourse } from "@/lib/lecturer-access";
import { timetableSlotSchema } from "@/lib/validations";
import type { Profile } from "@/types/database";

async function requireTimetableAccess(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "lecturer", "admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, profile: profile as Profile };
}

async function assertCourseAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: Profile,
  courseId: string
) {
  const { data: course } = await supabase
    .from("courses")
    .select("id, code, lecturer")
    .eq("id", courseId)
    .single();

  if (!course) return { error: NextResponse.json({ error: "Course not found" }, { status: 404 }) };
  if (!canLecturerAccessCourse(profile, course)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { course };
}

function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireTimetableAccess(supabase);
  if (auth.error) return auth.error;

  const body = await request.json();
  const courseId = body.course_id as string | undefined;
  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  const access = await assertCourseAccess(supabase, auth.profile!, courseId);
  if (access.error) return access.error;

  const parsed = timetableSlotSchema.safeParse({
    day_of_week: body.day_of_week,
    start_time: normalizeTime(String(body.start_time ?? "")),
    end_time: normalizeTime(String(body.end_time ?? "")),
    venue: String(body.venue ?? "").trim(),
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const slot = parsed.data;
  const { data: timetable, error } = await supabase
    .from("timetables")
    .insert({
      course_id: courseId,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      venue: slot.venue,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: auth.user!.id,
    action: "timetable_slot_added",
    entity_type: "timetable",
    entity_id: timetable.id,
    details: { course_id: courseId, course_code: access.course!.code, ...slot },
  });

  return NextResponse.json({ timetable });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const auth = await requireTimetableAccess(supabase);
  if (auth.error) return auth.error;

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "Timetable slot ID required" }, { status: 400 });

  const { data: existing } = await supabase
    .from("timetables")
    .select("id, course_id, courses(code, lecturer)")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });

  const course = existing.courses as { code?: string; lecturer?: string | null };
  if (!canLecturerAccessCourse(auth.profile!, { lecturer: course?.lecturer ?? null })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = timetableSlotSchema.safeParse({
    day_of_week: body.day_of_week,
    start_time: normalizeTime(String(body.start_time ?? "")),
    end_time: normalizeTime(String(body.end_time ?? "")),
    venue: String(body.venue ?? "").trim(),
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const slot = parsed.data;
  const { data: timetable, error } = await supabase
    .from("timetables")
    .update({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      venue: slot.venue,
    })
    .eq("id", id)
    .select("*, courses(code)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: auth.user!.id,
    action: "timetable_slot_updated",
    entity_type: "timetable",
    entity_id: id,
    details: { course_id: timetable.course_id, ...slot },
  });

  return NextResponse.json({ timetable });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const auth = await requireTimetableAccess(supabase);
  if (auth.error) return auth.error;

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "Timetable slot ID required" }, { status: 400 });

  const { data: existing } = await supabase
    .from("timetables")
    .select("id, course_id, courses(code, lecturer)")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });

  const course = existing.courses as { lecturer?: string | null };
  if (!canLecturerAccessCourse(auth.profile!, { lecturer: course?.lecturer ?? null })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("timetables").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: auth.user!.id,
    action: "timetable_slot_deleted",
    entity_type: "timetable",
    entity_id: id,
    details: {
      course_id: existing.course_id,
      course_code: (existing.courses as { code?: string })?.code,
    },
  });

  return NextResponse.json({ success: true });
}
