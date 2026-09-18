// schemas/event.ts
import { z } from "zod";

export const EventSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  location: z.string().optional().nullable(),
  startDate: z.string({ required_error: "Start date is required" }), // kept simple like AdmissionPeriod
  endDate: z.string({ required_error: "End date is required" }),
  image: z.string().optional().nullable(),
  isPublic: z.boolean({ required_error: "Public status is required" }), // same style as isActive
});

export type EventFormValues = z.infer<typeof EventSchema>;
