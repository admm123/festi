import { z } from "zod";

export const groupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(50, "Group name must be at most 50 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters"),
  needApproval: z.boolean(),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;
