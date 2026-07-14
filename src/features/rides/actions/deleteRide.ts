"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";

type DeleteRideResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Deletes a ride. Only the creator may delete it; participants cascade away.
 */
export async function deleteRide(rideId: string): Promise<DeleteRideResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { id: true, title: true, creatorId: true },
  });

  if (!ride) {
    return { success: false, error: "Ride not found." };
  }

  if (ride.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the ride creator can delete this ride.",
    };
  }

  await prisma.ride.delete({ where: { id: rideId } });

  revalidatePath("/dashboard/community-rides");

  await Logger.log(
    ActivityAction.OTHER,
    `${session.user.email} deleted the ride "${ride.title}".`,
    {
      actorId: session.user.id,
      targetType: "Ride",
      targetId: rideId,
      metadata: { title: ride.title },
    },
  );

  return {
    success: true,
    message: `${ride.title} has been deleted.`,
  };
}
