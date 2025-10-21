import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/shadcn/ui/sidebar";
import SidebarSignIn from "./SidebarSignIn";
import OfflineSidebarBoards from "./OfflineSidebarBoards";

function OfflineSidebarMaster() {
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
        <OfflineSidebarBoards />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSignIn />
      </SidebarFooter>
    </Sidebar>
  );
}

export default OfflineSidebarMaster;
