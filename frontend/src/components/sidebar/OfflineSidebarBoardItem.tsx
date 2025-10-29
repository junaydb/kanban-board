import { Link } from "@tanstack/react-router";
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
import { Button } from "@/shadcn/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  id: number;
  title: string;
};

export function OfflineSidebarBoardItem({ id, title }: Props) {
  const [open, setOpen] = useState(false);

  function handleBoardDelete() {
    //
  }

  return (
    <>
      <SidebarMenuItem key={title}>
        <SidebarMenuButton
          asChild
          onClick={(e) => {
            e.currentTarget.blur();
          }}
        >
          <Link to="/boards/$board" params={{ board: title }}>
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
