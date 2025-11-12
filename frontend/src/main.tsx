import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./trpc/trpc";
import { ServerNetworkStatusProvider } from "./context/ServerNetworkStatusContext";
import { ClientNetworkStatusProvider } from "./context/ClientNetworkStatusContext";

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
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ClientNetworkStatusProvider>
          <ServerNetworkStatusProvider>
            <RouterProvider router={router} />
          </ServerNetworkStatusProvider>
        </ClientNetworkStatusProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
