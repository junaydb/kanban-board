import { trpc, queryClient } from "./trpc";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { defaultRetry } from "./_helpers";
import type { BoardIdParams, PageQuery } from "@backend/util/types";

export function useGetAllTasks(boardId: BoardIdParams, enabled = true) {
  return useQuery(
    trpc.tasks.getAllFromBoard.queryOptions(boardId, {
      enabled,
      retry: defaultRetry,
    }),
  );
}

export function useGetTaskPage(
  {
    boardId,
    status,
    cursor,
    sortBy = "created",
    pageSize = 10,
    sortOrder = "ASC",
  }: PageQuery,
  enabled = true,
) {
  return useInfiniteQuery(
    trpc.tasks.getPage.infiniteQueryOptions(
      { boardId, status, cursor, sortBy, pageSize, sortOrder },
      {
        enabled,
        retry: defaultRetry,
        getNextPageParam: (lastPage) => lastPage.meta.cursor,
      },
    ),
  );
}
