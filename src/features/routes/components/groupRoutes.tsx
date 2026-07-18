"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  Loader2Icon,
  MountainIcon,
  RouteIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDistance,
  formatDuration,
  formatElevation,
} from "@/features/rides/lib/format";
import { deleteRoute } from "../actions/deleteRoute";
import { getGroupRoutes } from "../actions/getGroupRoutes";
import type { RouteSummary } from "../types";

/**
 * A group's shared route library. Members can plan a ride from any route;
 * only the route's creator can delete it.
 */
export function GroupRoutes({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();

  const {
    data: routes = [],
    isLoading,
    isError,
  } = useQuery<RouteSummary[]>({
    queryKey: ["group-routes", groupId],
    queryFn: () => getGroupRoutes(groupId),
  });

  const deleteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const result = await deleteRoute(routeId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["group-routes", groupId] });
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {["a", "b"].map((key) => (
          <Skeleton key={key} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Something went wrong loading routes.
      </p>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <RouteIcon className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No saved routes yet — save one from any ride with “Save route”.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {routes.map((route) => (
        <li
          key={route.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{route.name}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>{formatDistance(route.distance)}</span>
              <span>{formatDuration(route.duration)}</span>
              <span className="inline-flex items-center gap-0.5">
                <MountainIcon className="size-3" />
                {formatElevation(route.elevationGain)}
              </span>
              <span>by {route.createdBy.username ?? route.createdBy.name}</span>
            </p>
          </div>

          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/community-rides/new?routeId=${route.id}`}>
              Plan ride
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>

          {route.isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`Delete route ${route.name}`}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this route?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Rides already planned from it keep their own copy of the
                    route.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep route</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(route.id)}
                  >
                    {deleteMutation.isPending && (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </li>
      ))}
    </ul>
  );
}
