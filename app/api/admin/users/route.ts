import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const ALLOWED_ROLES: UserRole[] = ["student", "staff", "lecturer", "admin"];

function formatRoleUpdateError(message: string): string {
  if (message.includes("invalid input value for enum user_role")) {
    return (
      'Role "lecturer" is not in the database yet. Run migration 013 in Supabase SQL Editor: ' +
      "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lecturer';"
    );
  }
  return message;
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { user_id, role, is_active, programme_id } = body;

  if (!user_id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
    }
    updates.role = role;
  }
  if (is_active !== undefined) updates.is_active = is_active;
  if (programme_id !== undefined) updates.programme_id = programme_id || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service.from("profiles").update(updates).eq("id", user_id);

  if (error) {
    return NextResponse.json({ error: formatRoleUpdateError(error.message) }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "profile_updated",
    entity_type: "profile",
    entity_id: user_id,
    details: updates,
  });

  return NextResponse.json({ success: true });
}
