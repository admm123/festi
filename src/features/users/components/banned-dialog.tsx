"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { banUser } from "../actions/actions";
import { BAN_DURATIONS, type BanUserFormData, banUserSchema } from "../schemas";

export function BanUserDialog({
  userId,
  userName,
  disabled,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      duration: "7d",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: BanUserFormData) =>
      banUser(userId, values.reason, BAN_DURATIONS[values.duration]),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(data.message);
      setOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={disabled}>
          Ban
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <DialogHeader>
            <DialogTitle>Ban {userName}</DialogTitle>
            <DialogDescription>
              Add a reason and choose how long this user should be banned.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Textarea
                id="reason"
                placeholder="Reason for ban..."
                {...register("reason")}
                aria-invalid={!!errors.reason}
              />
              <FieldError errors={[errors.reason]} />
            </Field>

            <Field data-invalid={!!errors.duration}>
              <FieldLabel htmlFor="duration">Duration</FieldLabel>
              <Select
                value={watch("duration")}
                onValueChange={(value) =>
                  setValue("duration", value as BanUserFormData["duration"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select ban duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.duration]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Banning..." : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
