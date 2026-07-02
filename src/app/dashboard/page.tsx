import { requireAuth } from "@/features/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, UsersIcon, ZapIcon, TrendingUpIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0] || "Raver"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in the hardstyle scene
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Festivals
            </CardTitle>
            <CalendarIcon className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              In the next 3 months
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <UsersIcon className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Fellow ravers</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Festivals Attended
            </CardTitle>
            <ZapIcon className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hype Level</CardTitle>
            <TrendingUpIcon className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MAX</div>
            <p className="text-xs text-muted-foreground">
              Always ready to rave
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ZapIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">
              Start connecting with ravers and exploring festivals!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
