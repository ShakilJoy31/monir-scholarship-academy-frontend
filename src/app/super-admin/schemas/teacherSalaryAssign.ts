import { z } from "zod";

export const TeacherSalaryAssignSchema = z.object({
  teacherId: z.number({
    required_error: "Teacher ID is required",
    invalid_type_error: "Teacher ID must be a number",
  }),
  month: z.enum([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], {
    required_error: "Month is required",
    invalid_type_error: "Invalid month value",
  }),
});

export type TeacherSalaryAssignFormValues = z.infer<typeof TeacherSalaryAssignSchema>;
