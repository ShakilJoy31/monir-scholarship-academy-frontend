import { z } from "zod";

export const StudentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  classNameId: z.number().min(1, "Class is required"),
  classRoll: z.number().min(1, "Class roll is required"),
  sectionNameId: z.number().optional(),
  streamNameId: z.number().optional(),
  sessionYearId: z.number().min(1, "Session is required"),
  gender: z.enum(["Male", "Female", "Other"]).optional().or(z.literal("")),
  religion: z.enum(["Islam", "Hindu", "Christian", "Other"]).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  isTopStudent: z.boolean().optional().default(false),
  fatherName: z.string().optional().or(z.literal("")),
  motherName: z.string().optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
});

export type StudentUpdateFormValues = z.infer<typeof StudentUpdateSchema>;