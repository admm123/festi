"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";

type MarkAttendanceResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Marks whether an approved rider actually showed up. Only the ride creator
 * may mark attendance, and only once the ride's start time has passed.
 */
export async function markAttendance(
  participantId: string,
  attended: boolean,
): Promise<MarkAttendanceResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const participant = await prisma.rideParticipant.findUnique({
    where: { id: participantId },
    include: {
      ride: {
        select: { id: true, title: true, creatorId: true, startTime: true },
      },
    },
  });

  if (!participant) {
    return { success: false, error: "Participant not found." };
  }

  if (participant.ride.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the ride creator can mark attendance.",
    };
  }

  if (participant.status !== "APPROVED") {
    return {
      success: false,
      error: "Only approved riders can be marked as attended.",
    };
  }

  if (participant.ride.startTime.getTime() > Date.now()) {
    return {
      success: false,
      error: "Attendance can be marked after the ride starts.",
    };
  }

  await prisma.rideParticipant.update({
    where: { id: participantId },
    data: { attended },
  });

  revalidatePath(`/dashboard/community-rides/${participant.ride.id}`);

  await Logger.log(
    ActivityAction.RIDE_ATTENDANCE_MARKED,
    `${session.user.email} marked attendance for "${participant.ride.title}".`,
    {
      actorId: session.user.id,
      targetUserId: participant.userId,
      targetType: "Ride",
      targetId: participant.ride.id,
      metadata: { attended },
    },
  );

  return {
    success: true,
    message: attended ? "Marked as attended." : "Marked as no-show.",
  };
}
