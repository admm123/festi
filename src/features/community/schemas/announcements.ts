import { z } from "zod";

export const createAnnouncementSchema = z.object({
  groupId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Announcement cannot be empty.")
    .max(1000, "Announcements are limited to 1000 characters."),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
