import { Toggle } from "festi";
import { Bold, Star } from "lucide-react";

export function Variants() {
  return (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Bold" defaultPressed>
        <Bold />
      </Toggle>
      <Toggle aria-label="Favorite" variant="outline">
        <Star /> Favorite
      </Toggle>
      <Toggle aria-label="Disabled" disabled>
        Off
      </Toggle>
    </div>
  );
}
