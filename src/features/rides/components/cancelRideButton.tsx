"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BanIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { cancelRide } from "../actions/cancelRide";

export function CancelRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await cancelRide(rideId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BanIcon className="size-4" />
          Cancel ride
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this ride?</AlertDialogTitle>
          <AlertDialogDescription>
            The ride stays visible but is marked as cancelled. Everyone who
            requested to join or was approved will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep ride</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Cancel ride
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
