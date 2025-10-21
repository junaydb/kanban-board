import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/trpc";
import Banner from "../Banners";
import SpinnerBar from "../SpinnerBar";
import CreateBoardFormDialog from "../CreateBoardFormDialog";
import SidebarBoardItem from "./SidebarBoardItem";

function SidebarBoards() {
  const { data, error, isPending } = useQuery(
    trpc.boards.getAll.queryOptions(undefined, {
      // Do not retry query if we get an auth error or not found error
      retry: (failureCount, error) => {
        if (
          error?.data?.code === "UNAUTHORIZED" ||
          error?.data?.code === "NOT_FOUND"
        ) {
          return false;
        }
        return failureCount < 3;
      },
    }),
  );

  const boardData = data?.data.boards.map(({ id, title }) => ({ id, title }));

  // TODO:
  // - disable create board button when the user is at max board count
  // - add a mount delay to the loading spinner component to avoid it flashing in and out instantly
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
