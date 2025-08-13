import { router } from "./trpc.js";
import { tasksRouter } from "../routes/tasks.js";

export const appRouter = router({
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
