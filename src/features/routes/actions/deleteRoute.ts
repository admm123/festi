"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";

type Result =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Deletes a library route. Only the route's creator may delete it; rides
 * created from it are unaffected (they hold their own copy of the geometry).
 */
export async function deleteRoute(routeId: string): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: { creatorId: true, name: true },
  });

  if (!route) {
    return { success: false, error: "Route not found." };
  }

  if (route.creatorId !== session.user.id) {
    return {
      success: false,
      error: "Only the route's creator can delete it.",
    };
  }

  await prisma.route.delete({ where: { id: routeId } });

  await Logger.log(
    ActivityAction.ROUTE_DELETED,
    `${session.user.email} deleted the route "${route.name}".`,
    { actorId: session.user.id, targetType: "Route", targetId: routeId },
  );

  return { success: true, message: `Route "${route.name}" deleted.` };
}
