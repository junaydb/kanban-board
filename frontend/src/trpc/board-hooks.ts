import { trpc, queryClient } from "./trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { defaultRetry } from "./_helpers";
import type { BoardIdParams, UpdateBoardNameParams } from "@backend/util/types";

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

export function useUpdateBoardTitle() {
  return useMutation(
    trpc.boards.updateTitle.mutationOptions({
      onMutate: async ({ boardId, title }: UpdateBoardNameParams) => {
        const prevTitle = queryClient.getQueryData(
          trpc.boards.lookup.queryKey(),
        );

        queryClient.setQueryData(trpc.boards.lookup.queryKey({ boardId }), {
          data: { title },
        });

        return prevTitle;
      },
      onError: (_err, params, onMutateResult) => {
        const { boardId } = params;
        queryClient.setQueryData(trpc.boards.lookup.queryKey({ boardId }), {
          data: { title: onMutateResult!.data.title },
        });
      },
      onSettled: (_data, _error, variables) => {
        const { boardId } = variables;
        invalidateGetAllBoardsCache();
        invalidateLookUpBoardsCache({ boardId });
      },
    }),
  );
}

export function invalidateGetAllBoardsCache() {
  queryClient.invalidateQueries({
    queryKey: trpc.boards.getAll.queryKey(),
  });
}

export function invalidateLookUpBoardsCache(boardId: BoardIdParams) {
  queryClient.invalidateQueries({
    queryKey: trpc.boards.lookup.queryKey(boardId),
  });
}
