import { Label, Input } from "festi";

export function Default() {
  return (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="lbl-email">Email address</Label>
      <Input id="lbl-email" type="email" placeholder="rider@festi.cc" />
    </div>
  );
}
