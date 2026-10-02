import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
  Input,
  Label,
} from "festi";

export function Open() {
  return (
    <Dialog defaultOpen modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit ride</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit ride details</DialogTitle>
          <DialogDescription>
            Update the name and meeting point for your group ride.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-name">Ride name</Label>
          <Input id="d-name" defaultValue="Alpine Loop" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
