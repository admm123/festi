"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  MapPinIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { calculateRoute } from "../actions/calculateRoute";
import { createRide } from "../actions/createRide";
import { type RideFormValues, rideFormSchema } from "../schemas";
import type {
  PlaceResult,
  RouteProfile,
  RouteResult,
  Waypoint,
} from "../types";
import { LocationSearch } from "./locationSearch";
import { RideMap } from "./rideMap";
import { RouteStatsBar } from "./routeStatsBar";
import { RouteStatsPanel } from "./routeStatsPanel";
import { WaypointList } from "./waypointList";

const PROFILES: { value: RouteProfile; label: string }[] = [
  { value: "trekking", label: "Trekking" },
  { value: "fastbike", label: "Road / Fast" },
  { value: "gravel", label: "Gravel" },
];

type Step = "start" | "build" | "details";

const STEPS: { key: Step; label: string }[] = [
  { key: "start", label: "Start" },
  { key: "build", label: "Route" },
  { key: "details", label: "Details" },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors duration-300",
                active && "bg-primary text-primary-foreground",
                done && "bg-primary/15 text-primary",
                !active && !done && "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs font-semibold",
                  active && "bg-primary-foreground/20",
                  done && "bg-primary/20",
                  !active && !done && "bg-foreground/10",
                )}
              >
                {done ? <CheckIcon className="size-3" /> : index + 1}
              </span>
              {step.label}
            </div>
            {index < STEPS.length - 1 && (
              <div className="h-px w-4 bg-border sm:w-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RidePlanner() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [startPlace, setStartPlace] = useState<PlaceResult | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [profile, setProfile] = useState<RouteProfile>("trekking");
  const [roundTrip, setRoundTrip] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RideFormValues>({
    resolver: zodResolver(rideFormSchema),
    defaultValues: { title: "", description: "", startTime: "" },
  });

  const calcMutation = useMutation({
    mutationFn: (input: { waypoints: Waypoint[]; profile: RouteProfile }) =>
      calculateRoute(input),
    onSuccess: (result) => {
      if (result.success) {
        setRoute(result.route);
      } else {
        setRoute(null);
        toast.error(result.error);
      }
    },
    onError: () => {
      setRoute(null);
      toast.error("Could not calculate the route.");
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: RideFormValues) => {
      const result = await createRide({
        ...values,
        startLocation: startPlace?.name ?? "",
        waypoints,
        profile,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.push(`/dashboard/community-rides/${result.rideId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const calcMutate = calcMutation.mutate;

  // Recalculate the route (debounced) whenever the points or profile change.
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (waypoints.length < (roundTrip ? 3 : 2)) {
      setRoute(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      calcMutate({ waypoints, profile });
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [waypoints, profile, roundTrip, calcMutate]);

  const addWaypoint = (waypoint: Waypoint) => {
    setWaypoints((current) => {
      // In round-trip mode, insert before the returning end point.
      if (roundTrip && current.length >= 2) {
        const next = [...current];
        next.splice(next.length - 1, 0, waypoint);
        return next;
      }
      return [...current, waypoint];
    });
  };

  const removeWaypoint = (index: number) => {
    // The start point (index 0) is locked once chosen.
    if (index === 0 && startPlace) {
      return;
    }
    // The returning end point is locked in round-trip mode.
    if (roundTrip && index === waypoints.length - 1) {
      return;
    }
    setWaypoints((current) => current.filter((_, i) => i !== index));
  };

  const insertWaypoint = (index: number, waypoint: Waypoint) => {
    setWaypoints((current) => {
      const next = [...current];
      next.splice(index, 0, waypoint);
      return next;
    });
  };

  const moveWaypoint = (index: number, direction: -1 | 1) => {
    setWaypoints((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const repositionWaypoint = (index: number, waypoint: Waypoint) => {
    setWaypoints((current) => {
      const next = [...current];
      next[index] = waypoint;
      // In a round trip, keep start and end in sync (same location).
      if (roundTrip && next.length > 1) {
        const lastIndex = next.length - 1;
        if (index === 0) {
          next[lastIndex] = waypoint;
        } else if (index === lastIndex) {
          next[0] = waypoint;
        }
      }
      return next;
    });
  };

  const handleSelectStart = (place: PlaceResult) => {
    setStartPlace(place);
    const start = { lat: place.lat, lng: place.lng };
    setWaypoints(roundTrip ? [start, start] : [start]);
  };

  const toggleRoundTrip = (value: boolean) => {
    setRoundTrip(value);
    setWaypoints((current) => {
      if (!startPlace) {
        return current;
      }
      const start = { lat: startPlace.lat, lng: startPlace.lng };
      const last = current[current.length - 1];
      const endsAtStart =
        current.length > 1 &&
        last?.lat === start.lat &&
        last?.lng === start.lng;

      if (value) {
        return endsAtStart ? current : [...current, start];
      }
      return endsAtStart ? current.slice(0, -1) : current;
    });
  };

  const clearExtraPoints = () => {
    if (!startPlace) {
      setWaypoints([]);
      return;
    }
    const start = { lat: startPlace.lat, lng: startPlace.lng };
    setWaypoints(roundTrip ? [start, start] : [start]);
  };

  // Going back to step 1 resets the built route to a clean slate.
  const backToStart = () => {
    setRoute(null);
    clearExtraPoints();
    setStep("start");
  };

  const onSubmit = (values: RideFormValues) => {
    if (!route) {
      toast.error("Add at least two points to build a route first.");
      return;
    }
    createMutation.mutate(values);
  };

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="flex min-h-[calc(100svh-6.5rem)] flex-col gap-6">
      <StepIndicator current={step} />

      <div className="flex flex-1 flex-col justify-center">
        {step === "start" && (
          <div
            key="start"
            className="mx-auto w-full max-w-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-xl">
                  Where does your route start?
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Pick a public place to meet up with other riders — a square, a
                  station, a café or a well-known street.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <LocationSearch autoFocus onSelect={handleSelectStart} />

                {startPlace && (
                  <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm animate-in fade-in-0 zoom-in-95">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
                    <span className="line-clamp-2">{startPlace.name}</span>
                  </div>
                )}

                <label
                  htmlFor="round-trip"
                  className="flex cursor-pointer select-none items-center gap-2.5 text-sm"
                >
                  <Checkbox
                    id="round-trip"
                    checked={roundTrip}
                    onCheckedChange={(value) => toggleRoundTrip(value === true)}
                  />
                  <span>
                    Round trip
                    <span className="text-muted-foreground">
                      {" "}
                      — finish back at the start
                    </span>
                  </span>
                </label>

                <Button
                  className="self-end"
                  disabled={!startPlace}
                  onClick={() => setStep("build")}
                >
                  Continue
                  <ArrowRightIcon className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "build" && (
          <div
            key="build"
            className="grid animate-in gap-6 duration-300 fade-in-0 slide-in-from-right-2 lg:grid-cols-[1fr_340px]"
          >
            <Card className="overflow-hidden">
              <CardContent className="flex flex-col p-0">
                {/* Toolbar above the map: profile selector + live stats */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
                  <Select
                    value={profile}
                    onValueChange={(value) => setProfile(value as RouteProfile)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {PROFILES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RouteStatsBar route={route} />
                </div>

                <div className="h-[460px] w-full lg:h-[600px]">
                  <RideMap
                    waypoints={waypoints}
                    routeCoordinates={route?.coordinates}
                    interactive
                    initialCenter={
                      startPlace ? [startPlace.lng, startPlace.lat] : undefined
                    }
                    onAddWaypoint={addWaypoint}
                    onInsertWaypoint={insertWaypoint}
                    onMoveWaypoint={repositionWaypoint}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    Waypoints
                    <div className="flex items-center gap-2">
                      {calcMutation.isPending && (
                        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={waypoints.length <= 1}
                        onClick={clearExtraPoints}
                        aria-label="Clear extra points"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Click the map to add points, or drag the route line to shape
                    it.
                  </p>
                </CardHeader>
                <CardContent>
                  <WaypointList
                    waypoints={waypoints}
                    onRemove={removeWaypoint}
                    onMove={moveWaypoint}
                    lockedFirst={!!startPlace}
                    lockedLast={roundTrip}
                  />
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" onClick={backToStart}>
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Button>
                <Button disabled={!route} onClick={() => setStep("details")}>
                  Next
                  <ArrowRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "details" && (
          <div
            key="details"
            className="mx-auto w-full max-w-xl animate-in fade-in-0 slide-in-from-right-2 duration-300"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Ride details</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Give your ride a name and pick when you&apos;ll set off.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <RouteStatsPanel route={route} />

                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Sunday Morning Ride"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-destructive text-xs">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="startTime">Start time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      min={nowLocal}
                      {...register("startTime")}
                    />
                    {errors.startTime && (
                      <p className="text-destructive text-xs">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Where are we heading?"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-destructive text-xs">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("build")}
                    >
                      <ArrowLeftIcon className="size-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!route || createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <SaveIcon className="size-4" />
                      )}
                      Save ride
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
