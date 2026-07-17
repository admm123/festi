"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ALL_BIKES } from "../data/bikeData";

type BikeComboboxProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Searchable bike picker; also lets the user enter a custom bike. */
export function BikeCombobox({ value, onChange }: BikeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const showCustom =
    trimmed.length > 0 &&
    !ALL_BIKES.some((bike) => bike.toLowerCase() === trimmed.toLowerCase());

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Search for your bike…"}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search bikes…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No bike found.</CommandEmpty>
            {showCustom && (
              <CommandGroup heading="Custom">
                <CommandItem
                  value={`__custom__${trimmed}`}
                  onSelect={() => select(trimmed)}
                >
                  Use “{trimmed}”
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Bikes">
              {ALL_BIKES.map((bike) => (
                <CommandItem
                  key={bike}
                  value={bike}
                  onSelect={() => select(bike)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      value === bike ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {bike}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
