import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  Button,
  Label,
  Input,
} from "festi";

export function Open() {
  return (
    <Sheet defaultOpen modal={false}>
      <SheetTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filter rides</SheetTitle>
          <SheetDescription>
            Narrow the list by distance and surface.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <Label htmlFor="sh-max">Max distance (km)</Label>
          <Input id="sh-max" defaultValue="100" />
        </div>
        <SheetFooter>
          <Button>Apply</Button>
          <SheetClose asChild>
            <Button variant="ghost">Reset</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
