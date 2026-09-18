import { z } from "zod";

export const ExpenseSchema = z.object({
  note: z.string().optional().or(z.literal("")),
  expenseCategoryId: z.number().min(1, "Category is required"),
  expenseSubcategoryId: z.number().min(1, "Subcategory is required"),
  totalAmount: z.number().optional(),
  date: z.string().optional(), // use z.coerce.date() if you want auto-parsing
  image: z.string().optional().or(z.literal("")),
  payments: z
    .array(
      z.object({
        accountId: z.number().optional(),
        paymentAmount: z.number().optional(),
      })
    )
    .optional(),
});

export type ExpenseFormValues = z.infer<typeof ExpenseSchema>;
