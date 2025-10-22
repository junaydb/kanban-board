import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/shadcn/ui/sidebar";
import { useIsMobile } from "@/shadcn/hooks/use-mobile";
import { isMobileAgent } from "@/util/is-mobile-agent";
import { CircleAlert } from "lucide-react";
import { authClient } from "@/auth/auth-client";
import { Toaster } from "sonner";
import SidebarMaster from "@/components/sidebar/SidebarMaster";
import OfflineSidebarMaster from "@/components/sidebar/OfflineSidebarMaster";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const isMobile = useIsMobile();
  const isAgentMobile = isMobileAgent();

  if (isMobile || isAgentMobile) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4">
        <div className="h-full w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-3">
          <CircleAlert className="text-muted-foreground" size={24} />
          <p className="text-muted-foreground">
            This device is not currently supported
          </p>
        </div>
      </div>
    );
  }

  const { data: session } = authClient.useSession();

  return (
    <>
      <SidebarProvider>
        {session ? <SidebarMaster /> : <OfflineSidebarMaster />}
        <SidebarTrigger />
        <main className="w-full h-screen p-2">
          <Outlet />
        </main>
      </SidebarProvider>
      <Toaster richColors={true} />
    </>
  );
}

// TODO:
// - Add help button
// - Add a subtle transition to elements when they mount
// - Disable sign in button and use offline mode when server is unreachable
