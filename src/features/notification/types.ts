/** Every kind of notification we can send. Keep in sync with the Prisma `NotificationType` enum. */
export const NotificationType = {
  USER_FOLLOWED: "USER_FOLLOWED",
  GROUP_JOINED: "GROUP_JOINED",
  RIDE_JOIN_REQUEST: "RIDE_JOIN_REQUEST",
  RIDE_JOIN_APPROVED: "RIDE_JOIN_APPROVED",
  RIDE_JOIN_REJECTED: "RIDE_JOIN_REJECTED",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
