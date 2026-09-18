// schemas/assignFee.ts
import { z } from "zod";

export const AssignFeeSchema = z.object({
  feeType: z.enum(["MonthlyFee",  "AdmissionFee"], {
    required_error: "Fee type is required",
  }),
  sessionYearId: z.number({
    required_error: "Session year is required",
  }),
  classNameId: z.number({
    required_error: "Class name is required",
  }),
  sectionNameId: z.number({
    required_error: "Section name is required",
  }),
  streamNameId: z.number({
    required_error: "Stream name is required",
  }),
  amount: z.number({
    required_error: "Amount is required",
  }),
});

export type AssignFeeFormValues = z.infer<typeof AssignFeeSchema>;
