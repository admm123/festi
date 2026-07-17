"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { NotificationType, Notifier } from "@/features/notification";
import { prisma } from "@/lib/prisma";
import { rideIdSchema } from "../schemas";

type CancelRideResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Cancels a ride without deleting it. Only the creator may cancel; everyone
 * with a pending or approved spot is notified.
 */
export async function cancelRide(rideId: string): Promise<CancelRideResult> {
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
    select: { id: true, title: true, creatorId: true, status: true },
  });

  if (!ride) {
    return { success: false, error: "Ride not found." };
  }

  if (ride.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the ride creator can cancel this ride.",
    };
  }

  if (ride.status === "CANCELLED") {
    return { success: false, error: "This ride is already cancelled." };
  }

  await prisma.ride.update({
    where: { id: rideId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/community-rides");
  revalidatePath(`/dashboard/community-rides/${rideId}`);

  await Logger.log(
    ActivityAction.RIDE_CANCELLED,
    `${session.user.email} cancelled the ride "${ride.title}".`,
    {
      actorId: session.user.id,
      targetType: "Ride",
      targetId: rideId,
      metadata: { title: ride.title },
    },
  );

  const participants = await prisma.rideParticipant.findMany({
    where: { rideId, status: { in: ["PENDING", "APPROVED"] } },
    select: { userId: true },
  });

  await Promise.all(
    participants.map((participant) =>
      Notifier.push({
        type: NotificationType.RIDE_CANCELLED,
        userId: participant.userId,
        actorId: session.user.id,
        targetType: "Ride",
        targetId: rideId,
        message: ride.title,
      }),
    ),
  );

  return {
    success: true,
    message: `${ride.title} has been cancelled.`,
  };
}
