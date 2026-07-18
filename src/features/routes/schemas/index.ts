import { z } from "zod";

/** Saves a ride's route into the personal or a group's route library. */
export const saveRouteSchema = z.object({
  rideId: z.string().min(1, "Ride id is required."),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be at most 100 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters.")
    .optional()
    .or(z.literal("")),
  /** Optional group library. Membership is verified on the server. */
  groupId: z.string().nullish(),
});

export type SaveRouteInput = z.infer<typeof saveRouteSchema>;
