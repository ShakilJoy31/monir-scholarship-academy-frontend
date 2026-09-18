import { z } from "zod";

export const UpdateTeacherSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  designation: z.string().optional(),

  gender: z.enum(["Male", "Female", "Other"]).optional(),
  religion: z.enum(["Islam", "Hindu", "Christian", "Other"]).optional(),

  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  universityName: z.string().optional(),
  qualification: z.string().optional(),
  specialistSubject: z.string().optional(),
  universityStartDate: z.string().optional(),
  universityEndDate: z.string().optional(),
  avatar: z.string().optional(),
});

export type UpdateTeacherFormValues = z.infer<typeof UpdateTeacherSchema>;
