"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelGroupJoinRequest } from "../actions/cancelGroupJoinRequest";
import { joinGroup } from "../actions/joinGroup";
import { leaveGroup } from "../actions/leaveGroup";
import type { Group } from "../types";

export function GroupJoinButton({ group }: { group: Group }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const result =
        group.membershipStatus === "APPROVED"
          ? await leaveGroup(group.id)
          : group.membershipStatus === "PENDING"
            ? await cancelGroupJoinRequest(group.id)
            : await joinGroup(group.id);
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

  if (group.isOwner) {
    return null;
  }

  if (group.membershipStatus === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">Request pending</Badge>
        <Button
          size="sm"
          variant="ghost"
          disabled={mutation.isPending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            mutation.mutate();
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant={group.membershipStatus === "APPROVED" ? "outline" : "default"}
      disabled={mutation.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
    >
      {group.membershipStatus === "APPROVED"
        ? "Leave"
        : group.needApproval
          ? "Request to join"
          : "Join"}
    </Button>
  );
}
