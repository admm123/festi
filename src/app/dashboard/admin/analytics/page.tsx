import { requireAdmin } from "@/features/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3Icon } from "lucide-react";

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Platform statistics and insights
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>View detailed platform metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3Icon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Analytics dashboard coming soon
            </p>
            <p className="text-sm text-muted-foreground">
              User growth, engagement metrics, and more
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
