import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/shadcn/ui/sidebar";
import SidebarMaster from "@/components/sidebar/SidebarMaster";
import { useIsMobile } from "@/shadcn/hooks/use-mobile";
import { isMobileAgent } from "@/util/is-mobile-agent";
import { CircleAlert } from "lucide-react";
import * as boardHooks from "../trpc/board-hooks";

export const Route = createRootRoute({
  loader: async () => {
    return;
  },
  component: Root,
});

function Root() {
  const isMobile = useIsMobile();
  const isAgentMobile = isMobileAgent();

  // const boards = Route.useLoaderData();
  const boards = [
    {
      title: "Team project",
      slug: "/boards",
    },
    {
      title: "Capstone",
      slug: "/boards",
    },
    {
      title: "Event planning",
      slug: "/boards",
    },
  ];

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

  return (
    <SidebarProvider>
      <SidebarMaster boards={boards} />
      <SidebarTrigger />
      <main className="w-full h-screen p-2">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

// TODO:
// - Check if user is logged in
// - If user is logged in:
//    - Show user account module - should show user's name and profile picture (use gradient as profile picture fallback)
// - If user is logged out:
//    - Show sign in button where user account would be
//    - Also show warning to alert user that their changes are only being stored locally
// - Show "Open or a create a new board" text in main window when no board is open
// - Add button with "+" icon for quickly creating new boards
// - Implement create new board dialog
// - Add a settings button and help button
// - Add  a subtle transition to elements when they mount
//
// FIX:
// - Fix flash of unstyled content
// - I think this can be fixed by calling useSession() in the route's loader
