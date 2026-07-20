import { EventsExplorer } from "@/features/events/components/eventsExplorer";

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          RTF, CTF, marathons, gravel rides and more from the official BDR
          Breitensport calendar
        </p>
      </div>

      <EventsExplorer />
    </div>
  );
}
