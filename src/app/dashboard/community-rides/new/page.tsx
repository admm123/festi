import { requireAuth } from "@/features/auth/guards";
import { RidePlanner } from "@/features/rides/components/ridePlanner";

export default async function NewRidePage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plan a Ride</h1>
        <p className="text-muted-foreground">
          Click on the map to add points and we&apos;ll build the cycling route
          for you.
        </p>
      </div>

      <RidePlanner />
    </div>
  );
}
