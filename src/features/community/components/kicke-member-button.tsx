"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserMinusIcon } from "lucide-react";
import { toast } from "sonner";

import { kickGroupMember } from "../actions/actions";
import { Button } from "@/components/ui/button";

export function KickMemberButton({
  groupId,
  memberId,
}: {
  groupId: string;
  memberId: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => kickGroupMember({ groupId, memberId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <UserMinusIcon className="mr-2 size-4" />
      Kick
    </Button>
  );
}
