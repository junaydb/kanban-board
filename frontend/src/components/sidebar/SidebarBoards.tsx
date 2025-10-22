import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import Banner from "../Banners";
import SpinnerBar from "../SpinnerBar";
import CreateBoardFormDialog from "../CreateBoardFormDialog";
import SidebarBoardItem from "./SidebarBoardItem";
import { useGetAllBoards } from "@/trpc/board-hooks";

function SidebarBoards() {
  const { data, error, isPending } = useGetAllBoards();

  const boardData = data?.data.boards.map(({ id, title }) => ({ id, title }));

  // TODO:
  // - disable create board button when the user is at max board count
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarMenu>
        <CreateBoardFormDialog>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex justify-center border-2 border-dashed">
              <Plus />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </CreateBoardFormDialog>
        {isPending ? (
          <SpinnerBar>Loading boards...</SpinnerBar>
        ) : error?.data?.code === "UNAUTHORIZED" ? (
          <SidebarMenuItem>
            <Banner banner="AUTHORISATION_ERROR" />
          </SidebarMenuItem>
        ) : !data?.success ? (
          <SidebarMenuItem>
            <Banner banner="BOARD_FETCH_ERROR" />
          </SidebarMenuItem>
        ) : (
          boardData?.map(({ id, title }) => (
            <SidebarBoardItem key={id} id={id} title={title} />
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default SidebarBoards;
