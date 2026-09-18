import { z } from "zod";

// Zod schema
export const ExpenseCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ExpenseCategoryFormValues = z.infer<typeof ExpenseCategorySchema>;