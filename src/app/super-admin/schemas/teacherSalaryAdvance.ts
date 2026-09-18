import { z } from "zod";

export const TeacherSalaryAdvanceSchema = z.object({
  teacherId: z.number({
    required_error: "Teacher ID is required",
    invalid_type_error: "Teacher ID must be a number",
  }),
  month: z.enum([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ], {
    required_error: "Month is required",
    invalid_type_error: "Invalid month value",
  }),
  amount: z.number().optional(),
  note: z.string().optional(),
  payments: z.array(
    z.object({
      accountId: z.number({
        required_error: "Account ID is required",
        invalid_type_error: "Account ID must be a number",
      }),
      paymentAmount: z.number({
        required_error: "Payment amount is required",
        invalid_type_error: "Payment amount must be a number",
      }),
    })
  ).min(1, "At least one payment entry is required"),
});

export type TeacherSalaryAdvanceFormValues = z.infer<typeof TeacherSalaryAdvanceSchema>;
