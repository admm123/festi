import { z } from "zod";

export const BAN_DURATIONS = {
  "1h": 60 * 60,
  "1d": 60 * 60 * 24,
  "7d": 60 * 60 * 24 * 7,
  "30d": 60 * 60 * 24 * 30,
  permanent: undefined,
} as const;

export type BanDuration = keyof typeof BAN_DURATIONS;

export const banUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required")
    .max(500, "Reason must be at most 500 characters"),
  duration: z.enum(["1h", "1d", "7d", "30d", "permanent"]),
});

export type BanUserFormData = z.infer<typeof banUserSchema>;

export const ALLOWED_ROLES = ["user", "admin"] as const;

export const updateRoleSchema = z.object({
  role: z.enum(ALLOWED_ROLES),
});

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
