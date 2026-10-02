import { Badge } from "festi";
import { Check, Circle } from "lucide-react";

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}

export function WithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>
        <Check /> Verified
      </Badge>
      <Badge variant="secondary">
        <Circle className="fill-current" /> Live
      </Badge>
    </div>
  );
}
