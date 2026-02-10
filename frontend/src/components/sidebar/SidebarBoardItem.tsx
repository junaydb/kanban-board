import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import {
  invalidateGetAllBoardIdsAndTitleCache,
  useDeleteBoard,
} from "@/trpc/board-hooks";
import { toast } from "sonner";

type Props = {
  id: number;
  title: string;
};

export function SidebarBoardItem({ id, title }: Props) {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { mutate } = useDeleteBoard();
  const routerState = useRouterState();
  const navigate = useNavigate();

  function handleBoardDelete() {
    mutate(
      { boardId: id },
      {
        onSuccess: () => {
          invalidateGetAllBoardIdsAndTitleCache();

          // if this was the actively open board, navigate to /boards,
          // i.e., close this board
          const pathTail = routerState.location.pathname.split("/").pop();
          if (pathTail === title) {
            navigate({ to: "/boards" });
          }

          setOpen(!open);

          toast.success("Board deleted");
        },
        onError: (error) => {
          switch (error?.data?.code) {
            case "NOT_FOUND":
              toast.error("Board not found (maybe it was already deleted?)");
              break;
            case "UNAUTHORIZED":
              toast.error("Authorisation error");
              break;
          }
        },
      },
    );
  }

  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton
        asChild
        onClick={(e) => {
          e.currentTarget.blur();
        }}
      >
        {/* link to user boards if the user logged in, otherwise link to offline boards */}
        {session ? (
          <Link
            className="truncate"
            to="/boards/$user/$boardId/$boardTitle"
            params={{
              user: toLowerKebabCase(session.user.name),
              boardId: String(id),
              boardTitle: toLowerKebabCase(title),
            }}
          >
            {title}
          </Link>
        ) : (
          <Link
            className="truncate"
            to="/boards/$boardTitle"
            params={{ boardTitle: toLowerKebabCase(title) }}
          >
            {title}
          </Link>
        )}
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
  );
}
