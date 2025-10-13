import { trpc } from "./trpc";
import { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";

export function useGetAllTasks(
  params: inferInput<typeof trpc.tasks.getAllFromBoard>,
) {
  return useQuery(trpc.tasks.getAllFromBoard.queryOptions(params));
}

export function useCreateTask() {
  return useMutation(trpc.tasks.create.mutationOptions());
}

export function useUpdateTaskStatus() {
  return useMutation(trpc.tasks.updateStatus.mutationOptions());
}

export function useDeleteTask() {
  return useMutation(trpc.tasks.delete.mutationOptions());
}

export function useGetTaskById(id: inferInput<typeof trpc.tasks.getById>) {
  return useQuery(trpc.tasks.getById.queryOptions(id));
}

export function useGetNextPage(params: inferInput<typeof trpc.tasks.getPage>) {
  return useInfiniteQuery(
    trpc.tasks.getPage.infiniteQueryOptions(params, {
      getNextPageParam: (lastPage: inferOutput<typeof trpc.tasks.getPage>) =>
        lastPage.meta.cursor || undefined,
    }),
  );
}

export function useGetTaskCount(
  params: inferInput<typeof trpc.tasks.getCount>,
) {
  return useQuery(trpc.tasks.getCount.queryOptions(params));
}
