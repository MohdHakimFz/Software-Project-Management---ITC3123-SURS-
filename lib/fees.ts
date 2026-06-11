import type { Course, FeeBreakdown, FeeStructure } from "@/types/database";

/** Tuition portion for a single course (credits × rate). */
export function courseTuitionFee(creditHours: number, tuitionPerCredit: number): number {
  return creditHours * Number(tuitionPerCredit);
}

export function calculateFees(
  courses: Course[],
  feeStructure: FeeStructure
): FeeBreakdown {
  const totalCredits = courses.reduce((sum, c) => sum + c.credit_hours, 0);
  const tuitionAmount = totalCredits * Number(feeStructure.tuition_per_credit);
  const registrationAmount = Number(feeStructure.registration_fee);
  const resourceAmount = Number(feeStructure.resource_fee);
  const totalAmount = tuitionAmount + registrationAmount + resourceAmount;

  return {
    tuitionAmount,
    registrationAmount,
    resourceAmount,
    totalAmount,
    totalCredits,
  };
}
