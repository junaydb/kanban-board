import Board from "../models/Board.js";
import { successResponse } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";

/*
 * All routes that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * Errors are handled at the top level in `index.ts` with the `app.onError` handler,
 * so try/catch blocks are not needed.
 */

export const boardsRouter = router({
  create: publicProcedure.input(IdSchema).query(async ({ input }) => {
    const boardId = input;
    const allTasks = await Task.getAllFromBoard(sessionToken, boardId);
    return successResponse.array(allTasks);
  }),

  updateName: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input }) => {
      const { boardId, title, status, due_date, description } = input;
      const task = await Task.create({
        title,
        status,
        dueDate: due_date,
        description,
        boardId,
      });
      return successResponse.single(task);
    }),

  delete: publicProcedure.input(IdSchema).mutation(async ({ input }) => {
    const id = input;
    await Task.delete(id);
    return successResponse.empty();
  }),
});
