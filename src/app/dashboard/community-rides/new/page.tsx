import { requireAuth } from "@/features/auth/guards";
import { RidePlanner } from "@/features/rides/components/ridePlanner";

export default async function NewRidePage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <RidePlanner />
    </div>
  );
}
