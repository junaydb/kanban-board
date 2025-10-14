import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import type { SidebarBoardItem } from "@/util/types";

type Props = {
  boards: SidebarBoardItem[];
};

function SidebarBoards({ boards }: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarMenu>
        {boards.map((board) => (
          <SidebarMenuItem key={board.title}>
            <SidebarMenuButton asChild>
              <Link to={board.slug}>
                <span>{board.title}</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuAction showOnHover className="cursor-pointer">
              <Trash2 className="text-red-500" />
              <span className="sr-only">Delete board</span>
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default SidebarBoards;
