"use client";

const COURSES = [
  "ACC301 · Management Accounting",
  "CT204 · Application Development",
  "CYS201 · Cyber Security",
  "CC204 · Artificial Intelligence",
  "ITC312 · Software Project Management",
  "BE203 · TESL Methodology",
  "BK201 · Strategic Communication",
  "AB301 · MBA Strategic Management",
  "AA201 · Bachelor of Accountancy",
  "CC203 · Computer Science",
];

export function CourseMarquee() {
  const items = [...COURSES, ...COURSES];

  return (
    <div className="relative overflow-hidden border-y border-border bg-[#001428] py-3 dark:bg-[#000a14]">
      <div className="marquee-track flex w-max gap-8">
        {items.map((course, i) => (
          <span
            key={`${course}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm font-medium text-white/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {course}
          </span>
        ))}
      </div>
    </div>
  );
}
