import { Slider } from "festi";

export function Default() {
  return (
    <div className="w-72">
      <Slider defaultValue={[40]} max={100} step={1} />
    </div>
  );
}

export function Range() {
  return (
    <div className="w-72">
      <Slider defaultValue={[20, 80]} max={100} step={1} />
    </div>
  );
}
