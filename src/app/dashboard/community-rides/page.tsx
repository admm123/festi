import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BikeIcon } from "lucide-react";

export default function RidesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Rides</h1>
        <p className="text-muted-foreground">
          Plan new rides and join others on their adventures
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Upcoming Rides</CardTitle>
          <CardDescription>
            Find rides to join or create your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BikeIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No rides scheduled yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first ride and invite others to join!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
