import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Connect with fellow hardstyle enthusiasts
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Ravers Network</CardTitle>
          <CardDescription>Find and connect with other ravers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No connections yet</p>
            <p className="text-sm text-muted-foreground">
              Start building your rave network!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
