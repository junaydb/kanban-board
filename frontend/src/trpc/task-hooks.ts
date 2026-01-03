import { trpc, queryClient } from "./trpc";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { defaultRetry } from "./_helpers";
import { useMemo } from "react";
import type {
  BoardIdParams,
  PageQuery,
  TaskSearchParams,
} from "@backend/util/types";

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
    sortBy = "position",
    pageSize = 10,
    sortOrder = "ASC",
  }: PageQuery,
  enabled = true,
) {
  const query = useInfiniteQuery(
    trpc.tasks.getPage.infiniteQueryOptions(
      { boardId, status, cursor, sortBy, pageSize, sortOrder },
      {
        enabled,
        retry: defaultRetry,
        getNextPageParam: (lastPage) => lastPage.meta.cursor,
      },
    ),
  );

  const tasks = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.data.tasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          dueTime: task.dueTime ? new Date(task.dueTime) : null,
        })),
      ),
    [query.data],
  );

  return { ...query, tasks };
}

// export function useSearchTasks(
//   { boardId, query }: TaskSearchParams,
//   enabled = true,
// ) {
//   return useQuery(
//     trpc.tasks.search.queryOptions(
//       { boardId, query },
//       {
//         enabled: enabled && query.length > 0,
//         retry: defaultRetry,
//       },
//     ),
//   );
// }

export function useUpdateTaskStatus() {
  return useMutation(trpc.tasks.updateStatus.mutationOptions());
}

export function useUpdateTaskPositions() {
  return useMutation(trpc.tasks.updatePositions.mutationOptions());
}

export function invalidateTaskPageCache(boardId: number) {
  queryClient.invalidateQueries({
    queryKey: trpc.tasks.getPage.queryKey({ boardId }),
  });
}
