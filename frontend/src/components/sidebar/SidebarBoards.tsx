import { Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/trpc";
import { authClient } from "@/auth/auth-client";
import { toLowerKebabCase } from "@/util/helpers";
import Banner from "../Banners";
import SpinnerBar from "../SpinnerBar";
import CreateBoardFormDialog from "../CreateBoardFormDialog";

function SidebarBoards() {
  const { data: session } = authClient.useSession();

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

  const boardTitles = data?.data.boards.map((board) => board.title);

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
            <Banner banner="AUTH_ERROR" />
          </SidebarMenuItem>
        ) : !data?.success ? (
          <SidebarMenuItem>
            <Banner banner="BOARD_FETCH_ERROR" />
          </SidebarMenuItem>
        ) : data?.success ? (
          boardTitles?.map((title) => (
            <SidebarMenuItem key={title}>
              <SidebarMenuButton asChild>
                <Link
                  to="/boards/$user/$board"
                  params={{
                    user: toLowerKebabCase(session?.user.name!),
                    board: title,
                  }}
                >
                  {title}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuAction
                showOnHover
                className="cursor-pointer"
                onClick={(e) => {
                  e.currentTarget.blur();
                }}
              >
                <Trash2 className="text-red-500" />
                <span className="sr-only">Delete board</span>
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default SidebarBoards;
