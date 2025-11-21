import { trpc } from "./trpc";
import { queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { BoardIdParams } from "@backend/util/types";

export function useGetAllTasks(boardId: BoardIdParams, enabled = true) {
  return useQuery(
    trpc.tasks.getAllFromBoard.queryOptions(boardId, {
      enabled,

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
}
