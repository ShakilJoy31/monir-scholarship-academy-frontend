import { z } from "zod";

export const UpdateSuperAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().optional(),
});

export type UpdateSuperAdminFormValues = z.infer<typeof UpdateSuperAdminSchema>;