import { z } from "zod";

export const StudentSchema = z.object({
  sessionYearId: z.number().min(1, "Session year ID is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  // isTopStudent: z.boolean().optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters"),
  classNameId: z.number().min(1, "Class ID is required"),
  classRoll: z.number().min(1, "Class roll is required"),
  sectionNameId: z.number().optional(),
  streamNameId: z.number().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional().or(z.literal("")),
  religion: z
    .enum(["Islam", "Hindu", "Christian", "Other"])
    .optional()
    .or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  fatherName: z.string().optional().or(z.literal("")),
  motherName: z.string().optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
  subjects: z.array(z.number()).optional(),
});

export type StudentFormValues = z.infer<typeof StudentSchema>;