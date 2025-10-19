import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/shadcn/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shadcn/ui/field";
import { Input } from "@/shadcn/ui/input";
import { trpc } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toLowerKebabCase } from "@/util/helpers";
import { authClient } from "@/auth/auth-client";

type Props = {
  children: React.ReactNode;
};

const BoardTitleSchema = z.object({
  title: z
    .string()
    .min(1, "Board title cannot be empty")
    .max(50, "Board title cannot be more than 50 characters"),
});

function CreateBoardFormDialog({ children }: Props) {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const { handleSubmit, control, reset } = useForm<
    z.infer<typeof BoardTitleSchema>
  >({
    resolver: zodResolver(BoardTitleSchema),
    defaultValues: {
      title: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { mutate, data, isSuccess, isError, error } = useMutation(
    trpc.boards.create.mutationOptions(),
  );

  const { data: session } = authClient.useSession();

  function onSubmit({ title }: z.infer<typeof BoardTitleSchema>) {
    mutate({ title });
  }

  function handleOpenChange(open: boolean) {
    setOpen(open);

    // to avoid a flash of the error resetting, reset the form when it opens, _not_ when it closes
    if (open) {
      reset();
    }
  }

  useEffect(() => {
    if (isSuccess) {
      navigate({
        to: "/boards/$user/$board",
        params: {
          user: toLowerKebabCase(session?.user.name!),
          board: toLowerKebabCase(data.data.title),
        },
      });

      setOpen(!open);
    }
    if (isError) {
      // TODO: error toast for when board creation fails
    }
  }, [isSuccess, isError]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
          <DialogDescription>
            Choose a name for your new board
          </DialogDescription>
        </DialogHeader>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {error?.data?.code === "CONFLICT" && (
                    <FieldError errors={[{ message: error?.message }]} />
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

export default CreateBoardFormDialog;
