import { Checkbox, Label } from "festi";

export function WithLabel() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="cb-terms" defaultChecked />
      <Label htmlFor="cb-terms">Share this ride with followers</Label>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="cb-on" defaultChecked />
        <Label htmlFor="cb-on">Checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb-off" />
        <Label htmlFor="cb-off">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb-dis" disabled />
        <Label htmlFor="cb-dis">Disabled</Label>
      </div>
    </div>
  );
}
