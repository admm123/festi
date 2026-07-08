"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateGroup } from "../actions/updateGroup";
import { type GroupFormData, groupFormSchema } from "../schemas";

export function EditGroupDialog({
  groupId,
  currentName,
  currentDescription,
  currentNeedApproval,
}: {
  groupId: string;
  currentName: string;
  currentDescription: string;
  currentNeedApproval: boolean;
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
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: currentName,
      description: currentDescription,
      needApproval: currentNeedApproval,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: GroupFormData) => {
      const result = await updateGroup({
        groupId,
        name: values.name,
        description: values.description,
        needApproval: values.needApproval,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(data.message);
      setOpen(false);
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
        if (!next) {
          reset({
            name: currentName,
            description: currentDescription,
            needApproval: currentNeedApproval,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <PencilIcon className="mr-2 size-4" />
          Edit Group
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>
              Update this group&apos;s name and description.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Group name</FieldLabel>
              <Input
                id="name"
                placeholder="Group name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Group description"
                {...register("description")}
                aria-invalid={!!errors.description}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field
              orientation="horizontal"
              className="justify-between rounded-lg border p-3"
            >
              <FieldLabel htmlFor="needApproval">Require approval</FieldLabel>
              <Switch
                id="needApproval"
                checked={watch("needApproval")}
                onCheckedChange={(checked) => setValue("needApproval", checked)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
