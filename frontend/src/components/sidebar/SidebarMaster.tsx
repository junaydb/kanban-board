import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/shadcn/ui/sidebar";
import { SidebarBoards } from "./SidebarBoards";
import { SidebarUser } from "./SidebarUser";
import { authClient } from "@/auth/auth-client";

export function SidebarMaster() {
  const { isPending } = authClient.useSession();

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
      <SidebarFooter>{isPending ? null : <SidebarUser />}</SidebarFooter>
    </Sidebar>
  );
}
