import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

export default function FestivalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Festivals</h1>
        <p className="text-muted-foreground">
          Discover and plan your next hardstyle adventure
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Upcoming Festivals</CardTitle>
          <CardDescription>Browse the latest hardstyle events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No festivals listed yet</p>
            <p className="text-sm text-muted-foreground">
              Check back soon for upcoming events!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
