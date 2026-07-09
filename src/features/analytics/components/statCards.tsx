"use client";

import {
  ActivityIcon,
  BanIcon,
  HeartIcon,
  MessageSquareIcon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
  WifiIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsStats } from "../types";

type StatCardsProps = {
  stats?: AnalyticsStats;
  isLoading: boolean;
};

const CARDS: {
  key: keyof AnalyticsStats;
  label: string;
  icon: typeof UsersIcon;
  hint?: string;
  accent?: string;
}[] = [
  { key: "totalUsers", label: "Total users", icon: UsersIcon },
  {
    key: "onlineUsers",
    label: "Online now",
    icon: WifiIcon,
    accent: "text-emerald-500",
  },
  { key: "newUsers", label: "New users", icon: UserPlusIcon },
  {
    key: "bannedUsers",
    label: "Banned users",
    icon: BanIcon,
    accent: "text-destructive",
  },
  { key: "totalGroups", label: "Groups", icon: UsersRoundIcon },
  { key: "totalFollows", label: "Follows", icon: HeartIcon },
  { key: "totalMessages", label: "Messages", icon: MessageSquareIcon },
  { key: "totalEvents", label: "Events (range)", icon: ActivityIcon },
];

export function StatCards({ stats, isLoading }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <Icon
                className={`size-4 ${card.accent ?? "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              {isLoading || !stats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">
                  {stats[card.key].toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
