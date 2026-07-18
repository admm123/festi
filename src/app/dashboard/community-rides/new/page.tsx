import { requireAuth } from "@/features/auth/guards";
import { RidePlanner } from "@/features/rides/components/ridePlanner";
import { getRoute } from "@/features/routes/actions/getRoute";

export default async function NewRidePage({
  searchParams,
}: {
  searchParams: Promise<{ routeId?: string }>;
}) {
  await requireAuth();

  // "Plan ride" from a library route lands here with ?routeId=… and skips
  // straight to the route-building step with the saved waypoints.
  const { routeId } = await searchParams;
  const libraryRoute = routeId ? await getRoute(routeId) : null;

  return (
    <div className="space-y-6">
      <RidePlanner
        initialRoute={
          libraryRoute
            ? { name: libraryRoute.name, waypoints: libraryRoute.waypoints }
            : null
        }
      />
    </div>
  );
}
