import { z } from "zod";

// Zod schema
export const ClassFeeDiscountSchema = z.object({
  studentId: z.number({ required_error: "Student ID is required" }),
  discountType: z.enum(["Fixed", "Percentage"], {
    required_error: "Discount type is required",
    invalid_type_error: "Discount type must be 'Fixed' or 'Percentage'",
  }),
  discount: z.number().min(1, "Discount is required"),
  image: z.string().optional(),
  note: z.string().optional(),
});

// Inferred Type
export type ClassFeeDiscountFormValues = z.infer<typeof ClassFeeDiscountSchema>;
