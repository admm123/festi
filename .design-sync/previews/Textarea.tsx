import { Textarea, Label } from "festi";

export function WithLabel() {
  return (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="ta-notes">Ride notes</Label>
      <Textarea
        id="ta-notes"
        placeholder="Add a description, meeting point, or pace…"
        defaultValue="Rolling tempo, regroup at the top of each climb."
      />
    </div>
  );
}
