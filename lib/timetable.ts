import type { Timetable } from "@/types/database";
import { DAY_NAMES } from "@/types/database";

export interface TimetableConflict {
  course1: string;
  course2: string;
  day: string;
  time: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsOverlap(a: Timetable, b: Timetable): boolean {
  if (a.day_of_week !== b.day_of_week) return false;
  const aStart = timeToMinutes(a.start_time);
  const aEnd = timeToMinutes(a.end_time);
  const bStart = timeToMinutes(b.start_time);
  const bEnd = timeToMinutes(b.end_time);
  return aStart < bEnd && bStart < aEnd;
}

export function detectConflicts(timetables: Timetable[]): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  for (let i = 0; i < timetables.length; i++) {
    for (let j = i + 1; j < timetables.length; j++) {
      if (slotsOverlap(timetables[i], timetables[j])) {
        conflicts.push({
          course1: timetables[i].courses?.code ?? timetables[i].course_id,
          course2: timetables[j].courses?.code ?? timetables[j].course_id,
          day: DAY_NAMES[timetables[i].day_of_week],
          time: `${timetables[i].start_time} - ${timetables[i].end_time}`,
        });
      }
    }
  }

  return conflicts;
}

export function wouldConflict(
  existing: Timetable[],
  candidate: Timetable
): boolean {
  return existing.some((slot) => slotsOverlap(slot, candidate));
}
