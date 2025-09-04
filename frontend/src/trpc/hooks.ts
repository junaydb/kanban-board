import { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import { trpc } from "./trpc";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";

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
      // initialPageParam: undefined as string | undefined,
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

export function useGetAllTasks(params: inferInput<typeof trpc.tasks.getAll>) {
  return useQuery(trpc.tasks.getAll.queryOptions(params));
}
