// schemas/hostelFeeAssign.ts
import { z } from "zod";

// List of valid months
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// Zod schema for Hostel Fee Assign
export const HostelBulkFeeAssignSchema = z.object({
  studentIds: z.array(z.number({ required_error: "Student is required" })).min(0, {message: "please select at lest one student"}),
  month: z.enum(months, { required_error: "Month is required" }),
});

// Type inference
export type HostelBulkFeeAssignFormValues = z.infer<typeof HostelBulkFeeAssignSchema>;
