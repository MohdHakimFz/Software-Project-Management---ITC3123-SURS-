import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDefaultTimetableSlot } from "@/lib/default-timetable";
import { courseSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = courseSchema.safeParse({
    ...body,
    code: String(body.code ?? "").trim().toUpperCase(),
    name: String(body.name ?? "").trim(),
    enrollment_deadline: body.enrollment_deadline || undefined,
    lecturer: body.lecturer || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const data = parsed.data;

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      code: data.code,
      name: data.name,
      description: data.description || null,
      programme_id: data.programme_id,
      credit_hours: data.credit_hours,
      capacity: data.capacity,
      lecturer: data.lecturer || null,
      semester: data.semester || "2026/1",
      enrollment_deadline: data.enrollment_deadline || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: `Course code "${data.code}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: timetableError } = await supabase
    .from("timetables")
    .insert(buildDefaultTimetableSlot(course.id, course.code));

  if (timetableError) {
    console.error("Failed to create default timetable:", timetableError.message);
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "course_created",
    entity_type: "course",
    entity_id: course.id,
    details: { code: course.code },
  });

  return NextResponse.json({ course });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "Course ID required" }, { status: 400 });

  const allowed = [
    "name",
    "description",
    "credit_hours",
    "capacity",
    "lecturer",
    "semester",
    "enrollment_deadline",
    "is_active",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      if (key === "credit_hours" || key === "capacity") {
        updates[key] = parseInt(String(fields[key]), 10);
      } else if (key === "is_active") {
        updates[key] = Boolean(fields[key]);
      } else if (key === "enrollment_deadline") {
        updates[key] = fields[key] || null;
      } else {
        updates[key] = fields[key];
      }
    }
  }

  const { data: course, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: fields.is_active === false ? "course_deactivated" : "course_updated",
    entity_type: "course",
    entity_id: id,
    details: updates,
  });

  return NextResponse.json({ course });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "Course ID required" }, { status: 400 });

  const { data: course, error: fetchError } = await supabase
    .from("courses")
    .select("id, code, name, enrolled_count")
    .eq("id", id)
    .single();

  if (fetchError || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.enrolled_count > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${course.code}" — ${course.enrolled_count} student(s) enrolled. Deactivate the course instead.`,
      },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "course_deleted",
    entity_type: "course",
    entity_id: id,
    details: { code: course.code, name: course.name },
  });

  return NextResponse.json({ success: true });
}
