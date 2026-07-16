"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requestJoinRide } from "../actions/requestJoinRide";
import type { RideParticipantStatus } from "../types";

type RideJoinButtonProps = {
  rideId: string;
  isCreator: boolean;
  participantStatus: RideParticipantStatus | null;
  isPast?: boolean;
  className?: string;
};

export function RideJoinButton({
  rideId,
  isCreator,
  participantStatus,
  isPast = false,
  className,
}: RideJoinButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await requestJoinRide(rideId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      router.refresh();
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isCreator) {
    return (
      <Badge variant="secondary" className={className}>
        Your ride
      </Badge>
    );
  }

  if (participantStatus === "APPROVED") {
    return (
      <Badge variant="default" className={className}>
        Joined
      </Badge>
    );
  }

  if (participantStatus === "PENDING") {
    return (
      <Badge variant="outline" className={className}>
        Request sent
      </Badge>
    );
  }

  if (participantStatus === "REJECTED") {
    return (
      <Badge variant="destructive" className={className}>
        Declined
      </Badge>
    );
  }

  if (isPast) {
    return (
      <Badge variant="outline" className={className}>
        Ride ended
      </Badge>
    );
  }

  return (
    <Button
      size="sm"
      className={className}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending && <Loader2Icon className="size-4 animate-spin" />}
      Request Join
    </Button>
  );
}
