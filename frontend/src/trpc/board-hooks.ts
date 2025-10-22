import { trpc } from "./trpc";
import { queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useGetAllBoards() {
  return useQuery(
    trpc.boards.getAll.queryOptions(undefined, {
      // do not retry query if we get an auth error or not found error
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

export function useCreateBoard() {
  return useMutation(trpc.boards.create.mutationOptions());
}

export function useDeleteBoard() {
  return useMutation(trpc.boards.delete.mutationOptions());
}

export function invalidateBoardsCache() {
  queryClient.invalidateQueries({
    queryKey: trpc.boards.getAll.queryKey(),
  });
}
