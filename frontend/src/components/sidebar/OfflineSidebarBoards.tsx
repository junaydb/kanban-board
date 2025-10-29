import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import { OfflineSidebarBoardItem } from "./OfflineSidebarBoardItem";

export function OfflineSidebarBoards() {
  // TODO:
  // - disable create board button when the user is at max board count
  // - add a mount delay to the loading spinner component to avoid it flashing in and out instantly
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="flex justify-center border-2 border-dashed">
            <Plus />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
