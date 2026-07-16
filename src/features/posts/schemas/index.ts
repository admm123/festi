import { z } from "zod";

export const MAX_POST_IMAGES = 3;

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must be at most 150 characters"),
  content: z
    .string()
    .trim()
    .min(1, "Write something before posting")
    .max(5000, "Post must be at most 5000 characters"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/** Client-side form schema. Mirrors {@link createPostSchema}. */
export const postFormSchema = createPostSchema;

export type PostFormValues = z.infer<typeof postFormSchema>;

export const addCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a comment first")
    .max(1000, "Comment must be at most 1000 characters"),
});

export type AddCommentValues = z.infer<typeof addCommentSchema>;
