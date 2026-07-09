import { AnalyticsDashboard } from "@/features/analytics";
import { requireAdmin } from "@/features/auth/guards";

export default async function AnalyticsPage() {
  await requireAdmin();

  return <AnalyticsDashboard />;
}
