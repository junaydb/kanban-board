import { trpc, queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { defaultRetry } from "./_helpers";
import type { GetAllFromBoardParams, TTask } from "@backend/util/types";

export function useGetAllTasks({
  boardId,
  sortBy,
  sortOrder,
}: GetAllFromBoardParams) {
  function parseDates(tasks: TTask[]) {
    return tasks.map((task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      dueTime: task.dueTime ? new Date(task.dueTime) : null,
    }));
  }

  return useQuery(
    trpc.tasks.getAllFromBoard.queryOptions(
      { boardId, sortBy, sortOrder },
      {
        retry: defaultRetry,
        select: (data) => {
          const { todo, in_progress, done } = data.tasks;
          return {
            TODO: parseDates(todo),
            IN_PROGRESS: parseDates(in_progress),
            DONE: parseDates(done),
          };
        },
      },
    ),
  );
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

export function invalidateAllTasksCache(boardId: number) {
  queryClient.invalidateQueries({
    queryKey: trpc.tasks.getAllFromBoard.queryKey({ boardId }),
  });
}
