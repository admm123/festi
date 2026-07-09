import type { TimeRange } from "./schemas";

export type WarningLevel = "info" | "warning" | "critical";

export type AnalyticsWarning = {
  id: string;
  level: WarningLevel;
  title: string;
  description: string;
  count?: number;
};

export type AnalyticsStats = {
  totalUsers: number;
  onlineUsers: number;
  newUsers: number;
  bannedUsers: number;
  totalGroups: number;
  totalFollows: number;
  totalMessages: number;
  totalEvents: number;
};

export type TimeSeriesPoint = {
  date: string;
  count: number;
};

export type ActionBreakdown = {
  action: string;
  count: number;
};

export type TopActor = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  count: number;
};

export type RecentActivityEntry = {
  id: string;
  action: string;
  description: string | null;
  actorName: string | null;
  actorEmail: string | null;
  targetType: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export type AnalyticsData = {
  range: TimeRange;
  generatedAt: string;
  stats: AnalyticsStats;
  activityByDay: TimeSeriesPoint[];
  registrationsByDay: TimeSeriesPoint[];
  eventsByAction: ActionBreakdown[];
  topActors: TopActor[];
  recentActivity: RecentActivityEntry[];
  warnings: AnalyticsWarning[];
};
