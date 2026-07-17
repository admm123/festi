"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RIDE_DIFFICULTY_OPTIONS, RIDE_PACE_OPTIONS } from "../lib/format";
import type { RideFiltersInput } from "../schemas";
import type { RideDifficulty, RidePace } from "../types";
import { RidesGrid } from "./ridesGrid";

/** Radix Select items can't use an empty string, so "all" means no filter. */
const ALL = "all";

/**
 * Filter bar for the rides list: debounced text search over title/start
 * location, pace and difficulty selects, and a switch to include past rides.
 * The filters become part of the query key, so changing them refetches.
 */
export function RideFilters() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pace, setPace] = useState<RidePace | null>(null);
  const [difficulty, setDifficulty] = useState<RideDifficulty | null>(null);
  const [includePast, setIncludePast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: RideFiltersInput = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(pace ? { pace } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(includePast ? { includePast: true } : {}),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or start location"
            aria-label="Search rides"
            className="pl-8"
          />
        </div>

        <Select
          value={pace ?? ALL}
          onValueChange={(value) =>
            setPace(value === ALL ? null : (value as RidePace))
          }
        >
          <SelectTrigger className="sm:w-40" aria-label="Filter by pace">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value={ALL}>Any pace</SelectItem>
            {RIDE_PACE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficulty ?? ALL}
          onValueChange={(value) =>
            setDifficulty(value === ALL ? null : (value as RideDifficulty))
          }
        >
          <SelectTrigger className="sm:w-44" aria-label="Filter by difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value={ALL}>Any difficulty</SelectItem>
            {RIDE_DIFFICULTY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label
          htmlFor="include-past"
          className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-normal"
        >
          <Switch
            id="include-past"
            checked={includePast}
            onCheckedChange={setIncludePast}
          />
          Include past rides
        </Label>
      </div>

      <RidesGrid filters={filters} />
    </div>
  );
}
