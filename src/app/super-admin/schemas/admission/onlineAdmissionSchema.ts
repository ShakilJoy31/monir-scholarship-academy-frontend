import { z } from "zod";

// Zod schema for online admission form
export const OnlineAdmissionSchema = z.object({
  sessionYearId: z.number({ 
    required_error: "Session year is required" 
  }),
  branchId: z.number().optional().nullable(),
  classNameId: z.number({ 
    required_error: "Class is required" 
  }),
  sectionNameId: z.number().optional().nullable(),
  streamNameId: z.number().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  religion: z.enum(["Islam", "Hindu", "Christian", "Other"], {
  required_error: "Religion is required",
}),
  dob: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  previousSchool: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(), // Make optional if image upload might fail
});

// Type inference
export type OnlineAdmissionFormValues = z.infer<typeof OnlineAdmissionSchema>;