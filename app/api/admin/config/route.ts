import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const { data: existingConfig } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "academic_calendar")
    .maybeSingle();

  const previousSemester = (existingConfig?.value as { semester?: string } | undefined)?.semester;
  const newSemester = body.semester ?? "2026/1";

  await supabase
    .from("system_config")
    .upsert({
      key: "academic_calendar",
      value: {
        semester: newSemester,
        start_date: body.start_date,
        end_date: body.end_date,
        registration_open: body.registration_open,
      },
      updated_at: new Date().toISOString(),
    });

  if (previousSemester && previousSemester !== newSemester) {
    await supabase
      .from("fee_structures")
      .update({ semester: newSemester })
      .eq("is_active", true)
      .eq("semester", previousSemester);
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "config_updated",
    entity_type: "system_config",
    details: body,
  });

  return NextResponse.json({ success: true });
}
