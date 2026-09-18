import { z } from "zod";

export const BookFinePaySchema = z.object({
  totalAmount: z.number({ required_error: "Total amount is required" }),
  payments: z.array(
    z.object({
      accountId: z.number({ required_error: "Account ID is required" }),
      paymentAmount: z.number({ required_error: "Payment amount is required" }),
    })
  ),
});

export type BookFinePayFormValues = z.infer<typeof BookFinePaySchema>;