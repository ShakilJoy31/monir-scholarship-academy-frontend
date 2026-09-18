import { z } from "zod";

export const GroupSubjectSchema = z.object({
  classNameId: z.number({
    required_error: "Class Name is required",
    invalid_type_error: "Class Name must be a number",
  }),
  subjectNameId: z.array(
    z.number({
      required_error: "Subject ID must be a number",
      invalid_type_error: "Subject ID must be a number",
    })
  ).min(1, "At least one subject must be selected"),
});

export type GroupSubjectFormValues = z.infer<typeof GroupSubjectSchema>;
