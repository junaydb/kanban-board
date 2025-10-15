import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/shadcn/ui/sidebar";
import SidebarBoardsSection from "./SidebarBoards";
import SidebarUser from "./SidebarUser";
import SidebarSignIn from "./SidebarSignIn";
import { authClient } from "@/auth/auth-client";
import type { SidebarBoardItem } from "@/util/types";

type Props = {
  boards: SidebarBoardItem[];
};

function SidebarMaster({ boards }: Props) {
  const { data: session, isPending } = authClient.useSession();

  const user = {
    name: session?.user?.name || "",
    avatar: session?.user?.image || "",
    email: session?.user?.email || "",
  };

  if (isPending) {
    return null;
  }

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
        <SidebarBoardsSection boards={boards} />
      </SidebarContent>
      <SidebarFooter>
        {session ? <SidebarUser user={user} /> : <SidebarSignIn />}
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarMaster;
