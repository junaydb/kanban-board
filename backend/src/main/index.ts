import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/appRouter.js";
import { trpcServer } from "@hono/trpc-server";

const app = new Hono();

app.use(logger());

app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

if (!process.env.PROD) {
  app.use(
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PATCH", "DELETE"],
      allowHeaders: ["Content-Type"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );
}

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
  }),
);

serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT!),
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  },
);
