import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./trpc/trpc";
import { ServerHealthCheckProvider } from "./context/ServerHealthCheckContext";
import { ClientOnlineStatusProvider } from "./context/ClientOnlineContext";

import "./css/globals.css";

import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  notFoundMode: "root",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <ClientOnlineStatusProvider>
        <ServerHealthCheckProvider>
          <StrictMode>
            <RouterProvider router={router} />
          </StrictMode>
        </ServerHealthCheckProvider>
      </ClientOnlineStatusProvider>
    </QueryClientProvider>,
  );
}
