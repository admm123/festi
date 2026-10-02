import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  Button,
  Label,
  Input,
} from "festi";

export function Open() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Ride settings</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>Pace</PopoverTitle>
          <PopoverDescription>Set the target group pace.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 flex flex-col gap-2">
          <Label htmlFor="pp-pace">Average speed (km/h)</Label>
          <Input id="pp-pace" defaultValue="28" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
