import { trpc, queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { defaultRetry } from "./_helpers";
import type { BoardIdParams } from "@backend/util/types";

export function useGetAllBoards(enabled = true) {
  return useQuery(
    trpc.boards.getAll.queryOptions(undefined, {
      enabled,
      retry: defaultRetry,
    }),
  );
}

export function useBoardLookup(boardId: BoardIdParams) {
  return useQuery(
    trpc.boards.lookup.queryOptions(boardId, {
      retry: defaultRetry,
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
