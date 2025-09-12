import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./trpc/trpc.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";

const app = express();

app.use(morgan("combined"));
app.use(express.static("public"));

if (process.env.PROD === "false") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  console.log("CORS enabled");
}

app.all("/api/auth/*", toNodeHandler(auth));

app.use(
  "/api/trpc/*",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const port = parseInt(process.env.PORT!) || 3000;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
