import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/shadcn/ui/sidebar";
import SidebarBoards from "./SidebarBoards";
import SidebarUser from "./SidebarUser";
import SidebarSignIn from "./SidebarSignIn";
import { authClient } from "@/auth/auth-client";
import Banner from "../Banners";

function SidebarMaster() {
  const {
    data: session,
    error: authError,
    isPending,
  } = authClient.useSession();

  const user = {
    name: session?.user?.name || "",
    avatar: session?.user?.image || "",
    email: session?.user?.email || "",
  };

  if (isPending) {
    // TODO: loading ui
    return null;
  }

  // TODO: fallback ui for auth error

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <span className="text-[1.2rem] font-semibold">KanbanXS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarBoards />
      </SidebarContent>
      <SidebarFooter>
        {session ? (
          <SidebarUser user={user} />
        ) : authError ? (
          <Banner banner="AUTH_ERROR" />
        ) : (
          <SidebarSignIn />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarMaster;
