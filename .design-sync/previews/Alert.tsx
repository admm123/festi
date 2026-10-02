import { Alert, AlertTitle, AlertDescription } from "festi";
import { Rocket, AlertTriangle } from "lucide-react";

export function Default() {
  return (
    <Alert>
      <Rocket />
      <AlertTitle>Route published</AlertTitle>
      <AlertDescription>
        Your Saturday group ride is now visible to followers.
      </AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>GPS sync failed</AlertTitle>
      <AlertDescription>
        We couldn&apos;t import your last activity. Check the connection and retry.
      </AlertDescription>
    </Alert>
  );
}
