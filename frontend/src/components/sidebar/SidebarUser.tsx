import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/shadcn/ui/dropdown-menu";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
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
import { Button } from "@/shadcn/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { authClient } from "@/auth/auth-client";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  user: {
    name: string;
    avatar: string;
    email: string;
  };
};

function SidebarUser({ user }: Props) {
  const navigate = useNavigate();

  async function handleSignOut() {
    const result = await authClient.signOut();
    if (result.data?.success) {
      // TODO: Success toast
      navigate({ to: "/boards" });
    }
    if (result.error) {
      // TODO: Error toast
    }
  }

  async function handleDeleteAccount() {
    const deleted = await authClient.deleteUser();
    navigate({ href: "/boards?accountRemoved=true" });
    if (deleted.data?.success) {
      // TODO: Success toast
      navigate({ to: "/boards" });
    }
    if (deleted.error) {
      // TODO: Error toast
    }
  }

  return (
    <Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Account
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>Your Account</DialogTitle>
        </DialogHeader>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All of your boards will be
                permanently deleted and unrecoverable.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

export default SidebarUser;
