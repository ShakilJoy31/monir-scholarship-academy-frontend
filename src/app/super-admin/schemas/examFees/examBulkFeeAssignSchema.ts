import { z } from "zod";

export const ExamBulkFeeAssignSchema = z.object({
  studentIds: z.array(z.number({required_error: "Student ID is required"})).min(1, {message: "Please select at least one student"}),
  examId: z.number({
    required_error: "Exam ID is required",
    invalid_type_error: "Exam ID must be a number",
  }),
  examFeeId: z.number({
    required_error: "Exam Fee ID is required",
    invalid_type_error: "Exam Fee ID must be a number",
  }),
});

export type ExamBulkFeeAssignFormValues = z.infer<typeof ExamBulkFeeAssignSchema>;
