"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { respondToGroupJoinRequest } from "../actions/respondToGroupJoinRequest";
import type { GroupJoinRequest } from "../types";

export function GroupJoinRequests({
  groupId,
  requests,
}: {
  groupId: string;
  requests: GroupJoinRequest[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      memberId,
      approve,
    }: {
      memberId: string;
      approve: boolean;
    }) => {
      const result = await respondToGroupJoinRequest({
        groupId,
        memberId,
        approve,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.refresh();
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No pending join requests.</p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between gap-4 rounded-lg border p-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={request.user.image ?? undefined} />
              <AvatarFallback>
                {request.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-medium">{request.user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                @{request.user.username ?? "rider"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ memberId: request.id, approve: true })
              }
            >
              <CheckIcon className="mr-2 size-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ memberId: request.id, approve: false })
              }
            >
              <XIcon className="mr-2 size-4" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
