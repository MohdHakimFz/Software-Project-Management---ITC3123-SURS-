/** Deterministic default class slot for a new course (until staff edits timetable). */
export function buildDefaultTimetableSlot(courseId: string, courseCode: string) {
  const hash = courseCode.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const dayOfWeek = (hash % 5) + 1; // Monday–Friday
  const startHour = 8 + (hash % 6); // 08:00–13:00 staggered starts
  const endHour = Math.min(startHour + 3, 17);
  const labNum = (hash % 5) + 1;
  const roomNum = 100 + (hash % 20);
  const isLab = /^(CT|CCS|DCS|FIT|CM)/i.test(courseCode);

  return {
    course_id: courseId,
    day_of_week: dayOfWeek,
    start_time: `${String(startHour).padStart(2, "0")}:00`,
    end_time: `${String(endHour).padStart(2, "0")}:00`,
    venue: isLab ? `Lab ${labNum}` : `Room ${roomNum}`,
  };
}
