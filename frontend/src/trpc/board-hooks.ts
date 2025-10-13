import { trpc } from "./trpc";
import { inferInput } from "@trpc/tanstack-react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetAllBoards() {
  return useQuery(trpc.boards.getAll.queryOptions());
}

export function useCreateBoard(title: inferInput<typeof trpc.boards.create>) {
  return useQuery(trpc.boards.create.queryOptions(title));
}

export function useUpdateBoardTitle() {
  return useMutation(trpc.boards.updateTitle.mutationOptions());
}

export function useDeleteBoard() {
  return useMutation(trpc.boards.delete.mutationOptions());
}
