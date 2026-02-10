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

export function useGetAllBoardIdsAndTitles(enabled = true) {
  return useQuery(
    trpc.boards.getAllIdsAndTitles.queryOptions(undefined, {
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
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.boards.lookup.queryKey({ boardId }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.boards.getAllIdsAndTitles.queryKey(),
          }),
        ]);

        const prevTitle = queryClient.getQueryData(
          trpc.boards.lookup.queryKey({ boardId }),
        );
        const prevBoards = queryClient.getQueryData(
          trpc.boards.getAllIdsAndTitles.queryKey(),
        );

        // Optimistically update the board title on the board and in the sidebar
        queryClient.setQueryData(trpc.boards.lookup.queryKey({ boardId }), {
          data: { title },
        });
        queryClient.setQueryData(trpc.boards.getAllIdsAndTitles.queryKey(), {
          ...prevBoards!,
          data: {
            boards: prevBoards!.data.boards.map((board) =>
              board.id === boardId ? { ...board, title } : board,
            ),
          },
        });

        return { prevTitle, prevBoards };
      },

      onError: (_err, params, onMutateResult) => {
        const { boardId } = params;

        // Rollback to previous cached values if we error
        queryClient.setQueryData(
          trpc.boards.lookup.queryKey({ boardId }),
          onMutateResult!.prevTitle,
        );
        queryClient.setQueryData(
          trpc.boards.getAllIdsAndTitles.queryKey(),
          onMutateResult!.prevBoards,
        );
      },

      // Refetch after error or success
      onSettled: (_data, _error, variables) => {
        const { boardId } = variables;
        invalidateGetAllBoardIdsAndTitleCache();
        invalidateLookUpBoardsCache({ boardId });
      },
    }),
  );
}

export function invalidateGetAllBoardIdsAndTitleCache() {
  queryClient.invalidateQueries({
    queryKey: trpc.boards.getAllIdsAndTitles.queryKey(),
  });
}

export function invalidateLookUpBoardsCache(boardId: BoardIdParams) {
  queryClient.invalidateQueries({
    queryKey: trpc.boards.lookup.queryKey(boardId),
  });
}
