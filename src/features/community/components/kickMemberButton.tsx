"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserMinusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { kickGroupMember } from "../actions/kickGroupMember";

export function KickMemberButton({
  groupId,
  memberId,
}: {
  groupId: string;
  memberId: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await kickGroupMember({ groupId, memberId });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
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
