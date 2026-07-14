import { z } from "zod";

export const waypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const routeProfileSchema = z
  .enum(["trekking", "fastbike", "gravel"])
  .default("trekking");

export const calculateRouteSchema = z.object({
  waypoints: z
    .array(waypointSchema)
    .min(2, "Add at least two points to build a route.")
    .max(25, "A route can have at most 25 points."),
  profile: routeProfileSchema,
});

export type CalculateRouteInput = z.infer<typeof calculateRouteSchema>;

export const createRideSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  startTime: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: "Start time must be in the future.",
  }),
  waypoints: z
    .array(waypointSchema)
    .min(2, "Add at least two points to build a route.")
    .max(25, "A route can have at most 25 points."),
  profile: routeProfileSchema,
});

export type CreateRideInput = z.infer<typeof createRideSchema>;

/** Client-side form schema. Route data is computed on the server. */
export const rideFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  startTime: z.string().min(1, "Start time is required"),
});

export type RideFormValues = z.infer<typeof rideFormSchema>;
