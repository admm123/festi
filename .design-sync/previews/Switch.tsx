import { Switch, Label } from "festi";

export function WithLabel() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="sw-public" defaultChecked />
      <Label htmlFor="sw-public">Public ride</Label>
    </div>
  );
}

export function States() {
  return (
    <div className="flex items-center gap-6">
      <Switch defaultChecked />
      <Switch />
      <Switch disabled />
    </div>
  );
}
