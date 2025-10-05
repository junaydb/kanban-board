import express from "express";
import morgan from "morgan";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./trpc/trpc.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import chalk from "chalk";

const app = express();

app.use(morgan("combined"));
app.use(express.static("public"));

if (process.env.NODE_ENV === "prod") {
  console.log(chalk.red("ENVIRONMENT: PRODUCTION"));
} else {
  console.log(chalk.yellow("ENVIRONMENT: TEST"));
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
