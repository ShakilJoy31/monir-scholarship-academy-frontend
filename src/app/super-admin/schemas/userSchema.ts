import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number({
    required_error: "Branch ID is required",
    invalid_type_error: "Branch ID must be a number",
  }),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must not exceed 12 characters")
    .optional()
    .or(z.literal('')), // Makes password completely optional
});

export type UserFormValues = z.infer<typeof UserSchema>;