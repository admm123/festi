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

export const SKILL_LEVEL_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const RIDING_STYLE_VALUES = [
  "road",
  "gravel",
  "mountain",
  "commuting",
  "touring",
  "cyclocross",
  "track",
  "ebike",
  "bmx",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const updateProfileSchema = z.object({
  bio: optionalText(500),
  location: optionalText(100),
  bikeBrand: optionalText(60),
  bikeModel: optionalText(60),
  skillLevel: z
    .enum(SKILL_LEVEL_VALUES)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  ridingStyles: z.array(z.enum(RIDING_STYLE_VALUES)).max(9).default([]),
  yearsRiding: z.number().int().min(0).max(80).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Client form schema (yearsRiding kept as a string for the input). */
export const profileFormSchema = z.object({
  bio: z.string().trim().max(500, "Bio must be at most 500 characters"),
  location: z.string().trim().max(100, "Location is too long"),
  bikeBrand: z.string().trim().max(60),
  bikeModel: z.string().trim().max(60),
  skillLevel: z.string(),
  ridingStyles: z.array(z.string()),
  yearsRiding: z.string().trim(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
