import type { SupabaseClient } from "@supabase/supabase-js";

export interface StaffOption {
  id: string;
  full_name: string;
  email: string;
}

export async function fetchStaffOptions(supabase: SupabaseClient): Promise<StaffOption[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "staff")
    .eq("is_active", true)
    .order("full_name");

  return data ?? [];
}

export async function fetchLecturerOptions(supabase: SupabaseClient): Promise<StaffOption[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "lecturer")
    .eq("is_active", true)
    .order("full_name");

  return data ?? [];
}
