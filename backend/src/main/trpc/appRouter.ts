import { router } from "./trpc.js";
import { tasksRouter } from "../routes/tasks.js";
import { boardsRouter } from "../routes/boards.js";

export const appRouter = router({
  tasks: tasksRouter,
  boards: boardsRouter,
});

export type AppRouter = typeof appRouter;
