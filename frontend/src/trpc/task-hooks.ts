import { trpc, queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { defaultRetry } from "./_helpers";
import type { GetAllFromBoardParams, BoardIdParams } from "@backend/util/types";

export function useGetAllTasks({
  boardId,
  sortBy,
  sortOrder,
}: GetAllFromBoardParams) {
  const result = useQuery(
    trpc.tasks.getAllFromBoard.queryOptions(
      { boardId, sortBy, sortOrder },
      { retry: defaultRetry },
    ),
  );

  const tasks = useMemo(() => {
    if (!result.data) return undefined;
    const { todo, in_progress, done } = result.data.tasks;
    return { TODO: todo, IN_PROGRESS: in_progress, DONE: done };
  }, [result.data]);

  return { ...result, data: tasks };
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

export function useGetNumTasks({ boardId }: BoardIdParams) {
  return useQuery(
    trpc.tasks.getNumTasks.queryOptions({ boardId }, { retry: defaultRetry }),
  );
}

export function useCreateTask({ boardId }: BoardIdParams) {
  return useMutation(
    trpc.tasks.create.mutationOptions({
      onSettled: () => {
        invalidateBoardTasksCache(boardId);
      },
    }),
  );
}

export function useUpdateTaskStatus() {
  return useMutation(trpc.tasks.updateStatus.mutationOptions());
}

export function useUpdateTaskPositions() {
  return useMutation(
    trpc.tasks.updatePositions.mutationOptions({
      onSettled: (_data, _error, variables) => {
        removeBoardTasksCache(variables.boardId);
      },
    }),
  );
}

export function invalidateBoardTasksCache(boardId: number) {
  queryClient.invalidateQueries({
    queryKey: trpc.tasks.getAllFromBoard.queryKey({ boardId }),
  });
  queryClient.invalidateQueries({
    queryKey: trpc.tasks.getNumTasks.queryKey({ boardId }),
  });
}

export function removeBoardTasksCache(boardId: number) {
  queryClient.removeQueries({
    queryKey: trpc.tasks.getAllFromBoard.queryKey({ boardId }),
  });
}
