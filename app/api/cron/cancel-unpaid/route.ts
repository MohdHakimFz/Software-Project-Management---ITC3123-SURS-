import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: unpaid } = await supabase
    .from("enrollments")
    .select("id, student_id, courses(code)")
    .eq("status", "pending")
    .lt("enrolled_at", threeDaysAgo.toISOString());

  if (!unpaid?.length) {
    return NextResponse.json({ cancelled: 0 });
  }

  const ids = unpaid.map((e) => e.id);
  await supabase
    .from("enrollments")
    .update({ status: "cancelled" })
    .in("id", ids);

  return NextResponse.json({ cancelled: unpaid.length });
}
