import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, tuition_per_credit, registration_fee, resource_fee, semester } = body;

  if (!id) return NextResponse.json({ error: "Fee structure ID required" }, { status: 400 });

  const { data: updated, error } = await supabase
    .from("fee_structures")
    .update({
      tuition_per_credit: Number(tuition_per_credit),
      registration_fee: Number(registration_fee),
      resource_fee: Number(resource_fee),
      semester: semester ?? "2026/1",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "fee_structure_updated",
    entity_type: "fee_structure",
    entity_id: id,
    details: { tuition_per_credit, registration_fee, resource_fee, semester },
  });

  return NextResponse.json({ fee: updated });
}
