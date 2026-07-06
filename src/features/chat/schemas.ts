import z from "zod";

export const MessageSchema = z.object({
  groupId: z.string(),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(200, "Message cannot be longer than 200 characters."),
});
