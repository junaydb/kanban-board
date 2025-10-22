import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shadcn/ui/tooltip";
import Banner from "../Banners";
import SpinnerBar from "../SpinnerBar";
import CreateBoardFormDialog from "../CreateBoardFormDialog";
import SidebarBoardItem from "./SidebarBoardItem";
import { useGetAllBoards } from "@/trpc/board-hooks";

function SidebarBoards() {
  const { data, error, isPending } = useGetAllBoards();

  const canCreateBoards = data?.meta.boardCount < data?.meta.boardCountLimit;

  const boardData = data?.data.boards.map(({ id, title }) => ({
    id,
    title,
  }));

  const createBoardButton = (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="flex justify-center border-2 border-dashed"
        disabled={!canCreateBoards}
      >
        <Plus />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarMenu>
        <CreateBoardFormDialog>
          {canCreateBoards ? (
            createBoardButton
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block w-full cursor-pointer">
                  {createBoardButton}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Maximum board limit reached</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CreateBoardFormDialog>
        {isPending ? (
          <SpinnerBar>Loading boards...</SpinnerBar>
        ) : error?.data?.code === "UNAUTHORIZED" ? (
          <SidebarMenuItem>
            <Banner banner="AUTHORISATION_ERROR" />
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
