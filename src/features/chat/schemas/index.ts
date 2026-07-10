import { z } from "zod";

export const MessageSchema = z.object({
  groupId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(200, "Message cannot be longer than 200 characters."),
});

export type MessageFormData = z.infer<typeof MessageSchema>;

export const DirectMessageSchema = z.object({
  recipientId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(200, "Message cannot be longer than 200 characters."),
});

export type DirectMessageFormData = z.infer<typeof DirectMessageSchema>;
