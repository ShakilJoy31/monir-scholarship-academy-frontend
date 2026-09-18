import { z } from "zod";


export const AdmissionPeriodSchema = z.object({
  sessionYearId: z.number({ required_error: "Session year is required" }),
  content: z.string({ required_error: "Content is required" }),
  startDate: z.string({ required_error: "Start date is required" }), 
  endDate: z.string({ required_error: "End date is required" }),
  isActive: z.boolean({ required_error: "IsActive status is required" }),
});

// Inferred Type
export type AdmissionPeriodFormValues = z.infer<typeof AdmissionPeriodSchema>;
