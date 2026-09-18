import { z } from "zod";

// Schema for Book Issue Creation
export const BookIssueSchema = z.object({
  bookId: z.number({ required_error: "Book ID is required" }),
  studentId: z.number({ required_error: "Student ID is required" }),
  dueDate: z.string({ required_error: "Due date is required" }), // or use z.coerce.date()
});

export type BookIssueFormValues = z.infer<typeof BookIssueSchema>;