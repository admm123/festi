import { requireAuth } from "@/features/auth/guards";
import { NewsGrid } from "@/features/news/components/newsGrid";

export default async function NewsPage() {
  await requireAuth();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cycling News</h1>
        <p className="text-muted-foreground">
          The latest from the world of cycling, updated throughout the day
        </p>
      </div>

      <NewsGrid />
    </div>
  );
}
