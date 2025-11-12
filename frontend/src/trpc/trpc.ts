import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/trpc/appRouter";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// tRPC + TanStack Query setup,
// tRPC takes full ownership of query keys

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});

export const queryClient = new QueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
export type Status = RouterOutput["tasks"]["getById"]["data"]["status"];
