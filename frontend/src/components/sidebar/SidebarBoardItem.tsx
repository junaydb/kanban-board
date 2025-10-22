import { useMutation } from "@tanstack/react-query";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { trpc } from "@/trpc/trpc";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn/ui/alert-dialog";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/shadcn/ui/sidebar";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/shadcn/ui/button";
import { toLowerKebabCase } from "@/util/helpers";
import { Trash2 } from "lucide-react";
import { queryClient } from "@/trpc/trpc";

type Props = {
  id: number;
  title: string;
};

function SidebarBoardItem({ id, title }: Props) {
  const [open, setOpen] = useState(false);

  const { data: session } = authClient.useSession();

  const { mutate, isSuccess, error } = useMutation(
    trpc.boards.delete.mutationOptions(),
  );

  const routerState = useRouterState();

  const navigate = useNavigate();

  function handleBoardDelete() {
    mutate({ boardId: id });
  }

  if (error?.data?.code === "NOT_FOUND") {
    // TODO: error toast telling user board was probably already deleted
  } else if (error?.data?.code === "UNAUTHORIZED") {
    // TODO: auth error toast
  }

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: trpc.boards.getAll.queryKey(),
      });

      // if this was the actively open board, navigate to /boards
      if (
        routerState.location.pathname ===
        `/boards/${toLowerKebabCase(session?.user.name!)}/${title}`
      ) {
        navigate({ to: "/boards" });
      }

      setOpen(!open);
    }
  }, [isSuccess]);

  return (
    <>
      <SidebarMenuItem key={title}>
        <SidebarMenuButton
          asChild
          onClick={(e) => {
            e.currentTarget.blur();
          }}
        >
          <Link
            to="/boards/$user/$board"
            params={{
              user: toLowerKebabCase(session?.user.name!),
              board: title,
            }}
          >
            {title}
          </Link>
        </SidebarMenuButton>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className="cursor-pointer"
              onClick={(e) => {
                e.currentTarget.blur();
              }}
            >
              <Trash2 className="text-red-500" />
              <span className="sr-only">Delete board</span>
            </SidebarMenuAction>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleBoardDelete}>
                Delete Board
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </>
  );
}

export default SidebarBoardItem;
