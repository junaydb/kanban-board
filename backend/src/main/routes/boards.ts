import Board from "../models/Board.js";
import {
  BoardIdSchema,
  CreateBoardSchema,
  UpdateBoardNameSchema,
} from "./validation.schemas.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";

/*
 * All routes that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * Errors are handled at the top level in `index.ts` with the `app.onError` handler,
 * so try/catch blocks are not needed.
 */

export const boardsRouter = router({
  create: publicProcedure.input(CreateBoardSchema).query(async ({ input }) => {
    const board = await Board.create(input);
    return successResponseFactory.standard(board);
  }),

  updateName: publicProcedure
    .input(UpdateBoardNameSchema)
    .mutation(async ({ input }) => {
      const task = await Board.updateName(input);
      return successResponseFactory.standard(task);
    }),

  delete: publicProcedure.input(BoardIdSchema).mutation(async ({ input }) => {
    await Board.delete(input);
    return successResponseFactory.noData();
  }),
});
