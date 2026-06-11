import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  programme_id: z.string().uuid("Please select a programme"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const courseSchema = z.object({
  code: z.string().min(2, "Course code is required"),
  name: z.string().min(2, "Course name is required"),
  description: z.string().optional(),
  programme_id: z.string().uuid(),
  credit_hours: z.coerce.number().min(1).max(6),
  capacity: z.coerce.number().min(1).max(200),
  lecturer: z.string().optional(),
  semester: z.string(),
  enrollment_deadline: z.string().optional(),
});

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export const timetableSlotSchema = z
  .object({
    day_of_week: z.coerce.number().int().min(0).max(6),
    start_time: z.string().min(4, "Start time is required"),
    end_time: z.string().min(4, "End time is required"),
    venue: z.string().min(1, "Venue is required").max(100),
  })
  .refine((data) => timeToMinutes(data.end_time) > timeToMinutes(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type TimetableSlotInput = z.infer<typeof timetableSlotSchema>;
