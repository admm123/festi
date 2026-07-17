import "server-only";

import { headers } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Every activity we can log. Keep in sync with the Prisma `ActivityAction` enum. */
export const ActivityAction = {
  USER_REGISTERED: "USER_REGISTERED",
  USER_REGISTRATION_FAILED: "USER_REGISTRATION_FAILED",
  USER_LOGGED_IN: "USER_LOGGED_IN",
  USER_LOGIN_FAILED: "USER_LOGIN_FAILED",
  USER_LOGGED_OUT: "USER_LOGGED_OUT",
  USER_EMAIL_VERIFIED: "USER_EMAIL_VERIFIED",
  USER_UPDATED_PROFILE: "USER_UPDATED_PROFILE",
  USER_CHANGED_PASSWORD: "USER_CHANGED_PASSWORD",
  USER_BANNED: "USER_BANNED",
  USER_UNBANNED: "USER_UNBANNED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_FOLLOWED: "USER_FOLLOWED",
  USER_UNFOLLOWED: "USER_UNFOLLOWED",
  GROUP_CREATED: "GROUP_CREATED",
  GROUP_UPDATED: "GROUP_UPDATED",
  GROUP_DELETED: "GROUP_DELETED",
  GROUP_JOINED: "GROUP_JOINED",
  GROUP_LEFT: "GROUP_LEFT",
  GROUP_MEMBER_APPROVED: "GROUP_MEMBER_APPROVED",
  GROUP_MEMBER_REMOVED: "GROUP_MEMBER_REMOVED",
  GROUP_MESSAGE_SENT: "GROUP_MESSAGE_SENT",
  DIRECT_MESSAGE_SENT: "DIRECT_MESSAGE_SENT",
  RIDE_CREATED: "RIDE_CREATED",
  RIDE_UPDATED: "RIDE_UPDATED",
  RIDE_CANCELLED: "RIDE_CANCELLED",
  RIDE_JOIN_REQUESTED: "RIDE_JOIN_REQUESTED",
  RIDE_JOIN_APPROVED: "RIDE_JOIN_APPROVED",
  RIDE_JOIN_REJECTED: "RIDE_JOIN_REJECTED",
  RIDE_JOIN_WITHDRAWN: "RIDE_JOIN_WITHDRAWN",
  RIDE_LEFT: "RIDE_LEFT",
  GROUP_JOIN_REQUESTED: "GROUP_JOIN_REQUESTED",
  GROUP_MEMBER_REJECTED: "GROUP_MEMBER_REJECTED",
  POST_CREATED: "POST_CREATED",
  OTHER: "OTHER",
} as const;

export type ActivityAction =
  (typeof ActivityAction)[keyof typeof ActivityAction];

type LogInput = {
  /** The typed activity that happened. */
  action: ActivityAction;
  /** Who performed the action. */
  actorId?: string | null;
  /** The user this action targets (e.g. the followed user). */
  targetUserId?: string | null;
  /** Polymorphic reference to any other entity, e.g. "group". */
  targetType?: string | null;
  targetId?: string | null;
  /** Extra structured context for analytics. */
  metadata?: Prisma.InputJsonValue | null;
};

/**
 * Reads request context (IP / user agent) from the incoming headers.
 * Returns empty values when called outside a request scope.
 */
async function getRequestContext() {
  try {
    const h = await headers();
    const ipAddress =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    const userAgent = h.get("user-agent");
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

/**
 * Simple activity logger for server actions.
 *
 * @example
 * await Logger.log("USER_FOLLOWED", "User X followed User Y", {
 *   actorId: me.id,
 *   targetUserId: other.id,
 * });
 */
export const Logger = {
  async log(
    action: LogInput["action"],
    description: string,
    input: Omit<LogInput, "action"> = {},
  ) {
    try {
      const { ipAddress, userAgent } = await getRequestContext();

      await prisma.activityLog.create({
        data: {
          action,
          description,
          actorId: input.actorId ?? null,
          targetUserId: input.targetUserId ?? null,
          targetType: input.targetType ?? null,
          targetId: input.targetId ?? null,
          metadata: input.metadata ?? undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Logging must never break the action that triggered it.
      console.error("[Logger] Failed to write activity log:", error);
    }
  },
};
