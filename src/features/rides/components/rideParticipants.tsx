"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { respondToJoinRequest } from "../actions/respondToJoinRequest";
import type { RideParticipantInfo } from "../types";

type RideParticipantsProps = {
  isCreator: boolean;
  participants: RideParticipantInfo[];
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RideParticipants({
  isCreator,
  participants,
}: RideParticipantsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (input: { participantId: string; approve: boolean }) => {
      const result = await respondToJoinRequest(
        input.participantId,
        input.approve,
      );
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

  const approved = participants.filter((p) => p.status === "APPROVED");
  const pending = participants.filter((p) => p.status === "PENDING");

  return (
    <div className="flex flex-col gap-6">
      {isCreator && pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Join requests</h3>
          <ul className="flex flex-col gap-2">
            {pending.map((participant) => (
              <li
                key={participant.id}
                className="flex items-center gap-3 rounded-lg border p-2"
              >
                <Avatar className="size-8">
                  <AvatarImage src={participant.user.image ?? undefined} />
                  <AvatarFallback>
                    {initials(participant.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {participant.user.username ?? participant.user.name}
                </span>
                <Button
                  size="icon-sm"
                  variant="default"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      participantId: participant.id,
                      approve: true,
                    })
                  }
                  aria-label="Approve"
                >
                  {mutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <CheckIcon className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      participantId: participant.id,
                      approve: false,
                    })
                  }
                  aria-label="Decline"
                >
                  <XIcon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          Riders {approved.length > 0 && `(${approved.length})`}
        </h3>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No riders have joined yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {approved.map((participant) => (
              <li
                key={participant.id}
                className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1"
              >
                <Avatar className="size-6">
                  <AvatarImage src={participant.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {initials(participant.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {participant.user.username ?? participant.user.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
