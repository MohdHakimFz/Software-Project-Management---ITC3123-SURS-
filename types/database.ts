export type UserRole = "student" | "staff" | "lecturer" | "admin";
export type EnrollmentStatus = "pending" | "paid" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  programme_id: string | null;
  student_id: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  programmes?: Programme;
}

export type ProgrammeLevel =
  | "foundation"
  | "diploma"
  | "bachelor"
  | "professional"
  | "postgraduate";

export interface Faculty {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Programme {
  id: string;
  code: string;
  name: string;
  description: string | null;
  duration_years: number;
  faculty_id: string | null;
  level: ProgrammeLevel | null;
  is_active: boolean;
  created_at: string;
  faculties?: Faculty;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  programme_id: string;
  credit_hours: number;
  capacity: number;
  enrolled_count: number;
  lecturer: string | null;
  semester: string;
  enrollment_deadline: string | null;
  is_active: boolean;
  created_at: string;
  programmes?: Programme;
  timetables?: Timetable[];
}

export interface Timetable {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  created_at: string;
  courses?: Course;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  semester: string;
  enrolled_at: string;
  updated_at: string;
  courses?: Course;
  profiles?: Profile;
}

export interface FeeStructure {
  id: string;
  programme_id: string;
  tuition_per_credit: number;
  registration_fee: number;
  resource_fee: number;
  semester: string;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  tuition_amount: number;
  registration_amount: number;
  resource_amount: number;
  status: PaymentStatus;
  semester: string;
  receipt_number: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profiles?: Profile;
}

export interface FeeBreakdown {
  tuitionAmount: number;
  registrationAmount: number;
  resourceAmount: number;
  totalAmount: number;
  totalCredits: number;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
