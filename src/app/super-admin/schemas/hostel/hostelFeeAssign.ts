// schemas/hostelFeeAssign.ts
import { z } from "zod";

// List of valid months
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// Zod schema for Hostel Fee Assign
export const HostelFeeAssignSchema = z.object({
  studentId: z.number({ required_error: "Student is required" }),
  month: z.enum(months, { required_error: "Month is required" }),
});

// Type inference
export type HostelFeeAssignFormValues = z.infer<typeof HostelFeeAssignSchema>;
