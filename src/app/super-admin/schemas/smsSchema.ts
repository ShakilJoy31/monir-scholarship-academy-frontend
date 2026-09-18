// schemas/smsTemplate.ts
import { z } from "zod";

export const SmsTemplateSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  message: z.string({ required_error: "Message is required" }),
});

export type SmsTemplateFormValues = z.infer<typeof SmsTemplateSchema>;
