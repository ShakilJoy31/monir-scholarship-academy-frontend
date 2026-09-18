import { z } from "zod";

export const TeacherSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password cannot exceed 12 characters"),

  designation: z.string().min(1, "Designation is required"),

  nid: z.string().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional().or(z.literal("")),
  religion: z.enum(["Islam", "Hindu", "Christian", "Other"]).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  universityName: z.string().optional().or(z.literal("")),
  qualification: z.string().optional().or(z.literal("")),
  specialistSubject: z.string().optional().or(z.literal("")),
  universityStartDate: z.string().optional().or(z.literal("")),
  universityEndDate: z.string().optional().or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
});

export type TeacherFormValues = z.infer<typeof TeacherSchema>;
