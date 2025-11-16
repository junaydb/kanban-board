import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import { Banner } from "../Banners";
import { SpinnerBar } from "../SpinnerBar";
import { ErrorTooltip } from "../ErrorTooltip";
import { CreateBoardFormDialog } from "../CreateBoardFormDialog";
import { SidebarBoardItem } from "./SidebarBoardItem";
import { useGetAllBoards } from "@/trpc/board-hooks";
import { authClient } from "@/auth/auth-client";

export function SidebarBoards() {
  const { data: session } = authClient.useSession();
  const { data, isError, isPending, isEnabled } = useGetAllBoards(!!session);

  const boardLimitReached = !!(
    data && data.meta.boardCount >= data.meta.boardCountLimit
  );

  const boardData = data?.data.boards.map(({ id, title }) => ({
    id,
    title,
  }));

  const createBoardButton = (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="flex justify-center border-2 border-dashed"
        disabled={boardLimitReached}
      >
        <Plus />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  if (isEnabled) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Boards</SidebarGroupLabel>
        <SidebarMenu>
          {boardLimitReached ? (
            <ErrorTooltip text="Maximum board limit reached">
              {createBoardButton}
            </ErrorTooltip>
          ) : (
            <CreateBoardFormDialog>{createBoardButton}</CreateBoardFormDialog>
          )}
          {isError ? (
            <Banner banner="FETCH_ERROR" />
          ) : isPending ? (
            <SpinnerBar>Loading boards...</SpinnerBar>
          ) : (
            boardData?.map(({ id, title }) => (
              <SidebarBoardItem key={id} id={id} title={title} />
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  console.log("TODO: return from local storage");

  // local storage mode
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <CreateBoardFormDialog>{createBoardButton}</CreateBoardFormDialog>
      <SidebarMenu>
        {/*
          TODO: return boards from local storage
         */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
