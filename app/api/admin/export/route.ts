import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let csv = "";
  let filename = "export.csv";

  if (type === "enrollments") {
    const { data } = await supabase
      .from("enrollments")
      .select("*, courses(code, name), profiles(full_name, student_id)");
    csv = toCSV(
      ["Student", "Student ID", "Course", "Status", "Enrolled At"],
      (data ?? []).map((e) => [
        (e.profiles as { full_name?: string })?.full_name ?? "",
        (e.profiles as { student_id?: string })?.student_id ?? "",
        `${(e.courses as { code?: string })?.code} - ${(e.courses as { name?: string })?.name}`,
        e.status,
        e.enrolled_at,
      ])
    );
    filename = "enrollments.csv";
  } else if (type === "payments") {
    const { data } = await supabase
      .from("payments")
      .select("*, profiles(full_name, student_id)");
    csv = toCSV(
      ["Student", "Student ID", "Amount", "Status", "Receipt", "Paid At"],
      (data ?? []).map((p) => [
        (p.profiles as { full_name?: string })?.full_name ?? "",
        (p.profiles as { student_id?: string })?.student_id ?? "",
        String(p.amount),
        p.status,
        p.receipt_number ?? "",
        p.paid_at ?? "",
      ])
    );
    filename = "payments.csv";
  } else if (type === "students") {
    const { data } = await supabase
      .from("profiles")
      .select("*, programmes(code)")
      .eq("role", "student");
    csv = toCSV(
      ["Name", "Email", "Student ID", "Programme", "Phone", "Active"],
      (data ?? []).map((s) => [
        s.full_name,
        s.email,
        s.student_id ?? "",
        (s.programmes as { code?: string })?.code ?? "",
        s.phone ?? "",
        String(s.is_active),
      ])
    );
    filename = "students.csv";
  } else {
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
