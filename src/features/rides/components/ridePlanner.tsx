"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, SaveIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { calculateRoute } from "../actions/calculateRoute";
import { createRide } from "../actions/createRide";
import { type RideFormValues, rideFormSchema } from "../schemas";
import type { RouteProfile, RouteResult, Waypoint } from "../types";
import { RideMap } from "./rideMap";
import { RouteStatsPanel } from "./routeStatsPanel";
import { WaypointList } from "./waypointList";

const PROFILES: { value: RouteProfile; label: string }[] = [
  { value: "trekking", label: "Trekking" },
  { value: "fastbike", label: "Road / Fast" },
  { value: "gravel", label: "Gravel" },
];

export function RidePlanner() {
  const router = useRouter();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [profile, setProfile] = useState<RouteProfile>("trekking");
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

    if (waypoints.length < 2) {
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
  }, [waypoints, profile, calcMutate]);

  const addWaypoint = (waypoint: Waypoint) => {
    setWaypoints((current) => [...current, waypoint]);
  };

  const removeWaypoint = (index: number) => {
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
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[420px] w-full lg:h-[600px]">
            <RideMap
              waypoints={waypoints}
              routeCoordinates={route?.coordinates}
              interactive
              onAddWaypoint={addWaypoint}
              onInsertWaypoint={insertWaypoint}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Route
              {calcMutation.isPending && (
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={profile}
                onValueChange={(value) => setProfile(value as RouteProfile)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={waypoints.length === 0}
                onClick={() => setWaypoints([])}
                aria-label="Clear all points"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>

            <RouteStatsPanel route={route} />

            <WaypointList
              waypoints={waypoints}
              onRemove={removeWaypoint}
              onMove={moveWaypoint}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ride details</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <p className="text-xs text-destructive">
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
                  <p className="text-xs text-destructive">
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
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
