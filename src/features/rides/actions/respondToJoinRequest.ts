"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { NotificationType, Notifier } from "@/features/notification";
import { prisma } from "@/lib/prisma";

type RespondResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Approves or rejects a pending join request. Only the ride creator may
 * respond; the requesting user is notified of the decision.
 */
export async function respondToJoinRequest(
  participantId: string,
  approve: boolean,
): Promise<RespondResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const participant = await prisma.rideParticipant.findUnique({
    where: { id: participantId },
    include: {
      ride: { select: { id: true, title: true, creatorId: true } },
    },
  });

  if (!participant) {
    return { success: false, error: "Join request not found." };
  }

  if (participant.ride.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the ride creator can respond to requests.",
    };
  }

  if (participant.status !== "PENDING") {
    return {
      success: false,
      error: "This request has already been handled.",
    };
  }

  const status = approve ? "APPROVED" : "REJECTED";

  await prisma.rideParticipant.update({
    where: { id: participantId },
    data: { status },
  });

  revalidatePath(`/dashboard/community-rides/${participant.ride.id}`);

  await Logger.log(
    approve
      ? ActivityAction.RIDE_JOIN_APPROVED
      : ActivityAction.RIDE_JOIN_REJECTED,
    `${session.user.email} ${approve ? "approved" : "rejected"} a ride join request.`,
    {
      actorId: session.user.id,
      targetUserId: participant.userId,
      targetType: "Ride",
      targetId: participant.ride.id,
    },
  );

  await Notifier.push({
    type: approve
      ? NotificationType.RIDE_JOIN_APPROVED
      : NotificationType.RIDE_JOIN_REJECTED,
    userId: participant.userId,
    actorId: session.user.id,
    targetType: "Ride",
    targetId: participant.ride.id,
    message: participant.ride.title,
  });

  return {
    success: true,
    message: approve ? "Rider approved." : "Request declined.",
  };
}
