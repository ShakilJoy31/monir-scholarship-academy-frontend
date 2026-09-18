import { z } from 'zod';

export const SchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
                  .max(12, "Password must be at most 12 characters"),
  branchPermission: z.number().min(1)
});

export type SchoolFormValues = z.infer<typeof SchoolSchema>;