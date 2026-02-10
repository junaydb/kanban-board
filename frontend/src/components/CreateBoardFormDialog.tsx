import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/shadcn/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/shadcn/ui/field";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/shadcn/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toLowerKebabCase } from "@/util/helpers";
import { authClient } from "@/auth/auth-client";
import { useCreateBoard } from "@/trpc/board-hooks";
import { toast } from "sonner";

// TODO: prevent form resubmission when form is in CONFLICT error state and user has not changed input

const BoardTitleSchema = z.object({
  title: z
    .string()
    .min(1, "Board title cannot be empty")
    .max(50, "Board title cannot be more than 50 characters"),
});

export function CreateBoardFormDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { mutate } = useCreateBoard();

  const { handleSubmit, control, reset, setError } = useForm<
    z.infer<typeof BoardTitleSchema>
  >({
    resolver: zodResolver(BoardTitleSchema),
    defaultValues: {
      title: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  function onSubmit({ title }: z.infer<typeof BoardTitleSchema>) {
    if (session) {
      mutate(
        { title },
        {
          onSuccess: (data) => {
            navigate({
              to: "/boards/$user/$boardId/$boardTitle",
              params: {
                user: toLowerKebabCase(session.user.name),
                boardId: String(data.data.id),
                boardTitle: toLowerKebabCase(data.data.title),
              },
            });

            setOpen(false);
          },

          onError: (error) => {
            switch (error.data?.code) {
              case "CONFLICT":
                setError("title", {
                  type: error.data.code,
                  message: error.message,
                });
                break;
              case "UNAUTHORIZED":
                toast.error("Authorisation error");
                break;
            }
          },
        },
      );
    } else {
      console.log("TODO: save to local storage");
      // TODO: save to local storage

      navigate({
        to: "/boards/$boardTitle",
        params: {
          boardTitle: toLowerKebabCase(title),
        },
      });

      setOpen(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setOpen(open);

    // to avoid a flash caused by the error resetting, reset the form when it opens, _not_ when it closes
    if (open) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>Enter a name for your new board</DialogDescription>
        </VisuallyHidden>
        <form id="create-board-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-board-form-title">
                    Board title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-board-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter a title"
                    autoComplete="off"
                  />
                  <FieldDescription>This can be changed later</FieldDescription>
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
            <Button type="submit" form="create-board-form">
              Create
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
