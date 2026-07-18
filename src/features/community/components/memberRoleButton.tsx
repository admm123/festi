"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, ShieldCheckIcon, ShieldMinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateGroupMemberRole } from "../actions/updateGroupMemberRole";

/**
 * Owner control to promote a member to moderator or demote them back.
 */
export function MemberRoleButton({
  groupId,
  memberId,
  currentRole,
  memberName,
}: {
  groupId: string;
  memberId: string;
  currentRole: string;
  memberName: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isModerator = currentRole === "moderator";

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await updateGroupMemberRole({
        groupId,
        memberId,
        role: isModerator ? "member" : "moderator",
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.refresh();
      toast.success(result.message);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      aria-label={
        isModerator
          ? `Remove ${memberName} as moderator`
          : `Make ${memberName} a moderator`
      }
    >
      {mutation.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : isModerator ? (
        <ShieldMinusIcon className="size-4" />
      ) : (
        <ShieldCheckIcon className="size-4" />
      )}
      {isModerator ? "Remove moderator" : "Make moderator"}
    </Button>
  );
}
