import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { trpc } from "./trpc/trpc";
import { queryClient } from "./trpc/trpc";
import "./css/globals.css";

import { routeTree } from "./routeTree.gen";

// Create router with context
const router = createRouter({
  routeTree,
  context: {
    trpc,
    queryClient,
  },
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
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
