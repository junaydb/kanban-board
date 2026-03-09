import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shadcn/ui/field";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { useCreateTask } from "@/trpc/task-hooks";
import { toast } from "sonner";
import type { TaskStatusEnum } from "@backend/util/types";

type Props = {
  children: React.ReactNode;
  boardId: number;
  status: TaskStatusEnum;
};

const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot be more than 100 characters"),
  description: z
    .string()
    .max(10000, "Description cannot exceed 10000 characters")
    .optional(),
});

export function CreateTaskFormDialog({ children, boardId, status }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate } = useCreateTask({ boardId });

  const { handleSubmit, control, reset } = useForm<
    z.infer<typeof CreateTaskSchema>
  >({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: { title: "", description: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  function onSubmit({ title, description }: z.infer<typeof CreateTaskSchema>) {
    mutate(
      { boardId, title, description, status },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Task created");
        },
        onError: () => {
          toast.error("Failed to create task");
        },
      },
    );
  }

  function handleOpenChange(open: boolean) {
    setOpen(open);
    if (open) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form id="create-task-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-task-form-title">
                    Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-task-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter a title"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-task-form-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="create-task-form-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter a description (optional)"
                    rows={4}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field>
            <Button type="submit" form="create-task-form">
              Create
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
