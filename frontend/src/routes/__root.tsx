import { AppRouter } from "@backend/trpc/appRouter";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { QueryClient } from "@tanstack/react-query";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

const RootComponent = () => <Outlet />;

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});
