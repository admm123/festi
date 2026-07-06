"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGroupMessages, sendGroupMessage } from "../actions/chat-action";

import { SmileIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";
import { MessageSchema } from "../schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  isUserStillMember: boolean;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
};

type ChatData = {
  currentUserId: string;
  messages: ChatMessage[];
};

const emojis = [
  "😀",
  "😂",
  "😍",
  "🔥",
  "🚴",
  "💪",
  "👍",
  "❤️",
  "🎉",
  "😎",
  "😢",
  "😡",
];

export function GroupChat({ groupId }: { groupId: string }) {
  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: "",
      groupId: groupId,
    },
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ChatData>({
    queryKey: ["group-chat", groupId],
    queryFn: () => getGroupMessages(groupId),
    refetchInterval: 2000,
  });

  const messages = data?.messages ?? [];
  const currentUserId = data?.currentUserId;

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof MessageSchema>) =>
      sendGroupMessage(values),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["group-chat", groupId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className=" flex h-[520px] flex-col rounded-lg border bg-background">
      <div className="  flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((chatMessage) => {
            const isOwnMessage = chatMessage.user.id === currentUserId;
            const displayName = chatMessage.user.name;

            return (
              <div
                key={chatMessage.id}
                className={`flex gap-2 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwnMessage && (
                  <Avatar className="size-8">
                    <AvatarImage
                      src={
                        chatMessage.isUserStillMember
                          ? (chatMessage.user.image ?? undefined)
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {chatMessage.isUserStillMember
                        ? chatMessage.user.name.slice(0, 2).toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[75%] space-y-1 ${
                    isOwnMessage ? "items-end text-right" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{displayName}</span>
                    <span>
                      {new Intl.DateTimeFormat("en", {
                        timeStyle: "short",
                      }).format(new Date(chatMessage.createdAt))}
                    </span>
                  </div>

                  <div
                    className={`break-all rounded-2xl px-4 py-2 text-sm ${
                      isOwnMessage
                        ? "rounded-br-sm bg-red-500 text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    } ${!chatMessage.isUserStillMember ? "italic" : ""}`}
                  >
                    {chatMessage.isUserStillMember
                      ? chatMessage.content
                      : "<user not a member anymore>"}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t p-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Write a message..."
            maxLength={200}
            {...form.register("content")}
          />

          {form.formState.errors.content && (
            <p className="text-xs text-red-500">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <SmileIcon className="size-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-64">
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentValue = form.getValues("content");

                    form.setValue("content", currentValue + emoji, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          disabled={mutation.isPending || !form.watch("content").trim()}
          type="submit"
        >
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
