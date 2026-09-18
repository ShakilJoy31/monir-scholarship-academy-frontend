// schemas/studentClass.ts
import { z } from "zod";

// Zod schema
export const ClassFeeSchema = z.object({
  sessionYearId: z.number().min(1, "Session year is required"),
  classNameId: z.number().min(1, "Class is required"),
  sectionNameId: z.number().min(1, "Section is required"),
  streamNameId: z.number().min(1, "Stream is required"),
  amount: z.number({ required_error: "Amount is required" }),
});

// Inferred Type
export type ClassFeeFormValues = z.infer<typeof ClassFeeSchema>;