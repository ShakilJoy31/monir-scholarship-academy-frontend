// schemas/admissionFeePay.ts
import { z } from "zod";

export const AdmissionFeePaySchema = z.object({
  admissionId: z.number({ required_error: "Admission ID is required" }),
  amount: z.number({ required_error: "Amount is required" }),
  studentName: z.string().optional(),
  note: z.string().optional(),
  payments: z
    .array(
      z.object({
        accountId: z.number({ required_error: "Account ID is required" }),
        paymentAmount: z.number({ required_error: "Payment amount is required" }),
      })
    )
    .min(1, { message: "At least one payment method is required" }),
});

export type AdmissionFeePayFormValues = z.infer<typeof AdmissionFeePaySchema>;
