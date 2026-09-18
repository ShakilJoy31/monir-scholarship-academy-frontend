import { z } from 'zod';

export const BranchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  hotline: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  principalVoice: z.string().optional().or(z.literal('')),
  vicePrincipalVoice: z.string().optional().or(z.literal('')),
  eiin: z.string().optional().or(z.literal(''))
});

export type BranchFormValues = z.infer<typeof BranchSchema>;