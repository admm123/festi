import { Input, Label } from "festi";

export function WithLabel() {
  return (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="in-name">Ride name</Label>
      <Input id="in-name" placeholder="Saturday Social" />
    </div>
  );
}

export function States() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Input placeholder="Default" />
      <Input defaultValue="Alpine Loop" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" aria-invalid="true" />
    </div>
  );
}
