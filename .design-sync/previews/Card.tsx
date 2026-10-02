import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "festi";

export function Basic() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Alpine Loop</CardTitle>
        <CardDescription>84 km · 1,240 m climbing</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        A scenic tempo ride through the foothills, finishing with the Col du
        Test descent.
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">12 riders joined</span>
        <Button size="sm">Join ride</Button>
      </CardFooter>
    </Card>
  );
}

export function WithAction() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Weekend Rally</CardTitle>
        <CardDescription>Saturday · 08:00</CardDescription>
        <CardAction>
          <Badge variant="secondary">New</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Meet at the river bridge for a relaxed social pace.
      </CardContent>
    </Card>
  );
}
