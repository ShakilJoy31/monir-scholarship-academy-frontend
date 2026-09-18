import { z } from "zod";

// Zod schema
export const TeacherSalarySchema = z.object({
  teacherId: z.number({
    required_error: "Teacher ID is required",
    invalid_type_error: "Teacher ID must be a number",
  }),
  baseSalary: z.number({
    required_error: "Base salary is required",
    invalid_type_error: "Base salary must be a number",
  }),
});

// Type for form values
export type TeacherSalaryFormValues = z.infer<typeof TeacherSalarySchema>;
