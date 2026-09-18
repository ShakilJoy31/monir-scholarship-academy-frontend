import { z } from "zod";

export const BulkTeacherSalaryAssignSchema = z.object({
  teacherIds: z.array(z.number({required_error: "id must be number"})).min(1, {message: "Please select at lest 1 teacher"}),
  month: z.enum([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], {
    required_error: "Month is required",
    invalid_type_error: "Invalid month value",
  }),
});

export type BulkTeacherSalaryAssignFormValues = z.infer<typeof BulkTeacherSalaryAssignSchema>;
