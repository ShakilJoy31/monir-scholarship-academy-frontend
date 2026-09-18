import { z } from "zod";

// Zod schema
export const ClassBulkFeeAssignSchema = z.object({
  studentIds: z.array(z.number({ required_error: "Student ID is required" })).min(1, {message: "Please select at least one student"}),
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
export type ClassBulkFeeAssignFormValues = z.infer<typeof ClassBulkFeeAssignSchema>;
