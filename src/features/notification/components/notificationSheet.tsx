"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellDot, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsSeen,
  type NotificationItem,
} from "../actions/notification-actions";
import { NotificationType } from "../types";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

function notificationText(notification: NotificationItem) {
  const name = notification.actor?.name ?? "Someone";
  switch (notification.type) {
    case NotificationType.USER_FOLLOWED:
      return `${name} started following you.`;
    case NotificationType.GROUP_JOINED:
      return notification.message
        ? `${name} joined your group "${notification.message}".`
        : `${name} joined your group.`;
    default:
      return notification.message ?? "You have a new notification.";
  }
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === NotificationType.GROUP_JOINED) {
    return <Users className="size-4 text-red-500" />;
  }
  return <UserPlus className="size-4 text-red-500" />;
}

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const actor = notification.actor;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition ${
        notification.read ? "" : "bg-red-500/5"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="size-9">
          <AvatarImage src={actor?.image ?? undefined} alt={actor?.name} />
          <AvatarFallback>
            {actor?.name?.slice(0, 2).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-background">
          <NotificationIcon type={notification.type} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm">{notificationText(notification)}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {notification.read ? null : (
        <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
      )}
    </div>
  );
}

const NotificationSheet = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unread = 0 } = useQuery<number>({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 10000,
  });

  const { data: notifications, isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: open,
    refetchInterval: open ? 10000 : false,
  });

  const markSeen = useMutation({
    mutationFn: () => markNotificationsSeen(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // When the sheet opens, mark everything as seen.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per open
  useEffect(() => {
    if (open && unread > 0) {
      markSeen.mutate();
    }
  }, [open]);

  const items = notifications ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2 text-muted-foreground hover:bg-red-500/10 hover:text-foreground"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
        >
          <BellDot className="size-4 text-red-500" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Follows and group activity land here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellDot className="mb-4 size-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            </div>
          ) : (
            items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSheet;
