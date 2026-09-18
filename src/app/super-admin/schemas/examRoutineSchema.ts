import { z } from "zod";

export const ExamRoutineSchema = z.object({
  examNameId: z.number().optional(),
  sessionYearId: z.number().optional(),
  classNameId: z.number().optional(),
  sectionNameId: z.number().optional(),
  streamNameId: z.number().optional(),
  subjectNameId: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  examDate: z.string().optional(), // Consider z.coerce.date() if using a Date input
});

export type ExamRoutineFormValues = z.infer<typeof ExamRoutineSchema>;
