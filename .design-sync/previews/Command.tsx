import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "festi";
import { Map, Users, Settings, Plus } from "lucide-react";

export function Basic() {
  return (
    <Command className="w-80 rounded-lg border shadow-md">
      <CommandInput placeholder="Search rides and riders…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Rides">
          <CommandItem>
            <Map /> Alpine Loop
          </CommandItem>
          <CommandItem>
            <Plus /> New ride
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem>
            <Users /> Your groups
          </CommandItem>
          <CommandItem>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
