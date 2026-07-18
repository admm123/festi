"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, MegaphoneIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "../actions/createAnnouncement";
import { deleteAnnouncement } from "../actions/deleteAnnouncement";
import {
  type GroupAnnouncementItem,
  getGroupAnnouncements,
} from "../actions/getGroupAnnouncements";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/**
 * Group announcements: owners and moderators can post and delete; every
 * approved member sees the list. Posts notify all other members.
 */
export function GroupAnnouncements({
  groupId,
  canPost,
}: {
  groupId: string;
  /** True for the group owner and moderators (server re-checks). */
  canPost: boolean;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: announcements = [], isLoading } = useQuery<
    GroupAnnouncementItem[]
  >({
    queryKey: ["group-announcements", groupId],
    queryFn: () => getGroupAnnouncements(groupId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["group-announcements", groupId],
    });

  const postMutation = useMutation({
    mutationFn: async () => {
      const result = await createAnnouncement({ groupId, content });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setContent("");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const result = await deleteAnnouncement(announcementId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-4">
      {canPost && (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Announce something to the group…"
            rows={2}
            maxLength={1000}
            aria-label="New announcement"
          />
          <Button
            size="sm"
            disabled={postMutation.isPending || !content.trim()}
            onClick={() => postMutation.mutate()}
          >
            {postMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <MegaphoneIcon className="size-4" />
            )}
            Post announcement
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b"].map((key) => (
            <Skeleton key={key} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No announcements yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <Avatar className="size-8">
                <AvatarImage src={announcement.author.image ?? undefined} />
                <AvatarFallback>
                  {announcement.author.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line text-sm">
                  {announcement.content}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {announcement.author.username ?? announcement.author.name} ·{" "}
                  {formatDate(announcement.createdAt)}
                </p>
              </div>
              {announcement.canDelete && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(announcement.id)}
                  aria-label="Delete announcement"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
