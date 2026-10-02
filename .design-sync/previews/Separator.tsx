import { Separator } from "festi";

export function Horizontal() {
  return (
    <div className="w-72">
      <div className="text-sm font-medium">Alpine Loop</div>
      <div className="text-sm text-muted-foreground">Public route</div>
      <Separator className="my-3" />
      <div className="text-sm text-muted-foreground">84 km · 1,240 m</div>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Distance</span>
      <Separator orientation="vertical" />
      <span>Elevation</span>
      <Separator orientation="vertical" />
      <span>Pace</span>
    </div>
  );
}
