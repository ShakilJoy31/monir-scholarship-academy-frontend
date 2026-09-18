import { z } from "zod";

export const UpdateSchoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  branchPermission: z.number().min(1, "Branch permission is required"),
});

export type UpdateSchoolFormValues = z.infer<typeof UpdateSchoolSchema>;