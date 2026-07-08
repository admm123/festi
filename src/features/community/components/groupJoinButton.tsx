"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { joinGroup } from "../actions/joinGroup";
import { leaveGroup } from "../actions/leaveGroup";
import type { Group } from "../types";

export function GroupJoinButton({ group }: { group: Group }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = group.isMember
        ? await leaveGroup(group.id)
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

  return (
    <Button
      size="sm"
      variant={group.isMember ? "outline" : "default"}
      disabled={mutation.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
    >
      {group.isMember ? "Leave" : "Join"}
    </Button>
  );
}
