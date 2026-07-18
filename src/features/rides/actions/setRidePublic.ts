"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import { rideIdSchema } from "../schemas";

type Result =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Enables or disables the public (logged-out) page for a ride. Creator-only.
 */
export async function setRidePublic(
  rideId: string,
  isPublic: boolean,
): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const idParsed = rideIdSchema.safeParse(rideId);
  if (!idParsed.success) {
    return { success: false, error: "Ride not found." };
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { creatorId: true },
  });

  if (!ride) {
    return { success: false, error: "Ride not found." };
  }

  if (ride.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the ride creator can change the public link.",
    };
  }

  await prisma.ride.update({
    where: { id: rideId },
    data: { isPublic },
  });

  revalidatePath(`/dashboard/community-rides/${rideId}`);
  revalidatePath(`/rides/${rideId}`);

  return {
    success: true,
    message: isPublic ? "Public link enabled." : "Public link disabled.",
  };
}
