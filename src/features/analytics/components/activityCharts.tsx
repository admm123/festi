"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActionBreakdown, TimeSeriesPoint } from "../types";

const activityConfig = {
  count: { label: "Events", color: "var(--chart-1)" },
} satisfies ChartConfig;

const registrationsConfig = {
  count: { label: "Registrations", color: "var(--chart-2)" },
} satisfies ChartConfig;

const actionsConfig = {
  count: { label: "Count", color: "var(--chart-3)" },
} satisfies ChartConfig;

function formatDay(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ChartCard({
  title,
  description,
  isLoading,
  children,
}: {
  title: string;
  description: string;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[220px] w-full" /> : children}
      </CardContent>
    </Card>
  );
}

type ActivityChartsProps = {
  isLoading: boolean;
  activityByDay: TimeSeriesPoint[];
  registrationsByDay: TimeSeriesPoint[];
  eventsByAction: ActionBreakdown[];
};

export function ActivityCharts({
  isLoading,
  activityByDay,
  registrationsByDay,
  eventsByAction,
}: ActivityChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Activity over time"
        description="All logged events per day"
        isLoading={isLoading}
      >
        <ChartContainer config={activityConfig} className="h-[220px] w-full">
          <AreaChart data={activityByDay}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDay}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="count"
              type="monotone"
              fill="var(--color-count)"
              fillOpacity={0.2}
              stroke="var(--color-count)"
            />
          </AreaChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="New registrations"
        description="Sign-ups per day"
        isLoading={isLoading}
      >
        <ChartContainer
          config={registrationsConfig}
          className="h-[220px] w-full"
        >
          <AreaChart data={registrationsByDay}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDay}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="count"
              type="monotone"
              fill="var(--color-count)"
              fillOpacity={0.2}
              stroke="var(--color-count)"
            />
          </AreaChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Events by type"
        description="Breakdown of activity in the selected range"
        isLoading={isLoading}
      >
        <ChartContainer config={actionsConfig} className="h-[280px] w-full">
          <BarChart
            data={eventsByAction}
            layout="vertical"
            margin={{ left: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="action"
              tickLine={false}
              axisLine={false}
              width={160}
              tickFormatter={(value: string) =>
                value.replaceAll("_", " ").toLowerCase()
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Insights"
        description="Quick read on the selected range"
        isLoading={isLoading}
      >
        <div className="flex h-full flex-col justify-center gap-3 text-sm">
          {eventsByAction.length === 0 ? (
            <p className="text-muted-foreground">
              No events recorded in this range yet.
            </p>
          ) : (
            eventsByAction.slice(0, 6).map((event) => (
              <div
                key={event.action}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <span className="capitalize text-muted-foreground">
                  {event.action.replaceAll("_", " ").toLowerCase()}
                </span>
                <span className="font-semibold tabular-nums">
                  {event.count}
                </span>
              </div>
            ))
          )}
        </div>
      </ChartCard>
    </div>
  );
}
