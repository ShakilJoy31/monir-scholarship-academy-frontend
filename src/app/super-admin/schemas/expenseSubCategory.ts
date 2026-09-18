import { z } from "zod";

export const ExpenseSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  expenseCategoryId: z.number().min(1, "Category is required"),
});

export type ExpenseSubCategoryFormValues = z.infer<typeof ExpenseSubCategorySchema>;