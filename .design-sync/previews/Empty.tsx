import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
} from "festi";
import { Route } from "lucide-react";

export function Basic() {
  return (
    <Empty className="w-80 border rounded-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Route />
        </EmptyMedia>
        <EmptyTitle>No rides yet</EmptyTitle>
        <EmptyDescription>
          Create your first route to invite riders and start planning.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Create a ride</Button>
      </EmptyContent>
    </Empty>
  );
}
