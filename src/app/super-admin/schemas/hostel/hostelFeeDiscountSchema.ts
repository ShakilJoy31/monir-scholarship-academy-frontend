// schemas/hostelFeeDiscount.ts
import { z } from "zod";

// Zod schema
export const HostelFeeDiscountSchema = z.object({
  studentId: z.number({ required_error: "Student is required" }),
  discountType: z.enum(["Fixed", "Percentage"], {
    required_error: "Discount type is required",
  }),
  discount: z.number({ required_error: "Discount amount is required" }),
  image: z.string().optional(),
  note: z.string().optional(),
});

// Inferred type
export type HostelFeeDiscountFormValues = z.infer<typeof HostelFeeDiscountSchema>;
