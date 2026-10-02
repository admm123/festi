import { Progress } from "festi";

export function Values() {
  return (
    <div className="flex w-72 flex-col gap-4">
      <Progress value={25} />
      <Progress value={60} />
      <Progress value={100} />
    </div>
  );
}
