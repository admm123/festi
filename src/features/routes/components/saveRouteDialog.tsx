"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookMarkedIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getMyRideGroups } from "@/features/rides/actions/getMyRideGroups";
import { saveRoute } from "../actions/saveRoute";

/**
 * Saves the current ride's route into the personal or a group's route library.
 * Shown to the ride creator and approved participants (server re-checks).
 */
export function SaveRouteDialog({
  rideId,
  rideTitle,
}: {
  rideId: string;
  rideTitle: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(rideTitle);
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ["my-ride-groups"],
    queryFn: () => getMyRideGroups(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await saveRoute({
        rideId,
        name,
        description,
        groupId,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["group-routes"] });
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookMarkedIcon className="size-4" />
          Save route
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save route to library</DialogTitle>
          <DialogDescription>
            Reuse this route for future rides — privately or shared with a
            group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="route-name">Name</Label>
            <Input
              id="route-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="route-description">Description (optional)</Label>
            <Textarea
              id="route-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {groups.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="route-group">Group library (optional)</Label>
              <Select
                value={groupId ?? "none"}
                onValueChange={(value) =>
                  setGroupId(value === "none" ? null : value)
                }
              >
                <SelectTrigger id="route-group" className="w-full">
                  <SelectValue placeholder="Personal library" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="none">Personal library</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full"
            disabled={mutation.isPending || !name.trim()}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Save route
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
