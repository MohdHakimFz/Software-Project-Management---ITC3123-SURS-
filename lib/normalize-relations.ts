/** Supabase nested selects may return object or single-element array depending on inference. */
export function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function normalizeEnrollmentRow<
  T extends {
    profiles?: unknown;
    courses?: unknown;
  },
>(row: T) {
  return {
    ...row,
    profiles: unwrapRelation(row.profiles as { full_name?: string; student_id?: string } | null),
    courses: unwrapRelation(row.courses as { code?: string; name?: string } | null),
  };
}

export function normalizeProfileRow<T extends { profiles?: unknown }>(row: T) {
  return {
    ...row,
    profiles: unwrapRelation(row.profiles as { full_name?: string; student_id?: string } | null),
  };
}

export function normalizeAuditRow<T extends { profiles?: unknown }>(row: T) {
  return {
    ...row,
    profiles: unwrapRelation(row.profiles as { full_name?: string } | null),
  };
}
