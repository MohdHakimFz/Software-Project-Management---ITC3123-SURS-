export interface AcademicCalendar {
  semester: string;
  start_date?: string;
  end_date?: string;
  registration_open?: boolean;
}

export function parseAcademicCalendar(
  config: { key: string; value: unknown }[] | null | undefined
): AcademicCalendar {
  const raw = config?.find((c) => c.key === "academic_calendar")?.value as
    | AcademicCalendar
    | undefined;
  return {
    semester: raw?.semester ?? "2026/1",
    start_date: raw?.start_date,
    end_date: raw?.end_date,
    registration_open: raw?.registration_open !== false,
  };
}
