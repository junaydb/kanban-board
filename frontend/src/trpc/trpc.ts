import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "@backend/trpc/appRouter";

export type RouterOutput = inferRouterOutputs<AppRouter>;

// tRPC + TanStack Query setup,
// tRPC takes full ownership of query keys

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});

export const queryClient = new QueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

