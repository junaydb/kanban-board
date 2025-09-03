import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@backend/trpc/appRouter";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export type Status = RouterOutput["tasks"]["getById"]["data"]["status"];
export type Task = RouterOutput["tasks"]["getById"]["data"];
