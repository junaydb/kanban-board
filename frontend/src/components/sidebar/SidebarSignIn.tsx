import { authClient } from "@/auth/auth-client";
import { useClientNetworkStatus } from "@/context/ClientNetworkStatusContext";
import { useServerNetworkStatus } from "@/context/ServerNetworkStatusContext";
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shadcn/ui/sidebar";
import { SpinnerBar } from "../SpinnerBar";
import { ErrorTooltip } from "../ErrorTooltip";
import { AuthProviderButton } from "../AuthProviderButton";
import { AUTH_PROVIDERS } from "@/util/auth-providers";

export function SidebarSignIn() {
  const { isPending: authPending } = authClient.useSession();
  const clientOnline = useClientNetworkStatus();
  const serverOnline = useServerNetworkStatus();

  const signInButton = (
    <SidebarMenuButton
      size="lg"
      className="bg-gray-200/80 hover:bg-gray-200 active:bg-gray-200 data-[state=open]:bg-gray-200 cursor-pointer text-sidebar-accent-foreground justify-center"
      disabled={!clientOnline || !serverOnline ? true : false}
    >
      Sign in
    </SidebarMenuButton>
  );

  return (
    <Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          {!clientOnline ? (
            <ErrorTooltip text="You are offline">{signInButton}</ErrorTooltip>
          ) : !serverOnline ? (
            <ErrorTooltip text="Server unreachable">
              {signInButton}
            </ErrorTooltip>
          ) : authPending ? (
            <SpinnerBar />
          ) : (
            <DialogTrigger asChild>{signInButton}</DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Enables storing and accessing boards remotely
              </DialogDescription>
            </DialogHeader>
            {AUTH_PROVIDERS.map((provider) => (
              <AuthProviderButton provider={provider} />
            ))}
          </DialogContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Dialog>
  );
}
