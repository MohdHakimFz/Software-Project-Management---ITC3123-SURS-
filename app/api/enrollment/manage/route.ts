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

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { enrollment_id, action } = await request.json();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*, courses(code, name)")
    .eq("id", enrollment_id)
    .single();

  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    await supabase
      .from("enrollments")
      .update({ status: "confirmed" })
      .eq("id", enrollment_id);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "enrollment_approved",
      entity_type: "enrollment",
      entity_id: enrollment_id,
    });
  } else if (action === "reject") {
    await supabase
      .from("enrollments")
      .update({ status: "cancelled" })
      .eq("id", enrollment_id);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "enrollment_rejected",
      entity_type: "enrollment",
      entity_id: enrollment_id,
    });
  }

  return NextResponse.json({ success: true });
}
