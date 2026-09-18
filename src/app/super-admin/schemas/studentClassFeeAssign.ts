import { z } from "zod";

// Zod schema
export const ClassFeeAssignSchema = z.object({
  studentId: z.number({ required_error: "Student ID is required" }),
  month: z.enum([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ], {
    required_error: "Month is required",
    invalid_type_error: "Invalid month",
  }),
});

// Inferred Type
export type ClassFeeAssignFormValues = z.infer<typeof ClassFeeAssignSchema>;
