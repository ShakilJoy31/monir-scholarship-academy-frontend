import { z } from "zod";

export const ExamFeeAssignSchema = z.object({
  studentId: z.number({
    required_error: "Student ID is required",
    invalid_type_error: "Student ID must be a number",
  }),
  examId: z.number({
    required_error: "Exam ID is required",
    invalid_type_error: "Exam ID must be a number",
  }),
  examFeeId: z.number({
    required_error: "Exam Fee ID is required",
    invalid_type_error: "Exam Fee ID must be a number",
  }),
});

export type ExamFeeAssignFormValues = z.infer<typeof ExamFeeAssignSchema>;
