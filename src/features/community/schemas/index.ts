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

export const followUserFormSchema = z.object({
  targetId: z.string().trim().min(1, "User ID is required"),
});

export type FollowUserFormData = z.infer<typeof followUserFormSchema>;

export const respondToGroupJoinRequestSchema = z.object({
  groupId: z.string().trim().min(1, "Group ID is required"),
  memberId: z.string().trim().min(1, "Member ID is required"),
  approve: z.boolean(),
});

export type RespondToGroupJoinRequestData = z.infer<
  typeof respondToGroupJoinRequestSchema
>;
