import Board from "../models/Board.js";
import { BoardIdSchema, BoardTitleSchema } from "./_validators.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { verifyBoardOwnershipHandler } from "./_helpers.js";

/*
 * All procedures that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * All auth logic is handled within procedures that require it.
 *
 * All errors are handled by TRPC via throwing TRPCError with the respective error code.
 */

export const boardsRouter = router({
  create: publicProcedure
    .input(BoardTitleSchema.merge(BoardIdSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const board = await Board.create({
        userId: ctx.user!.id,
        title: input.title,
      });

      return successResponseFactory.single(board);
    }),

  updateName: publicProcedure
    .input(BoardTitleSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const task = await Board.updateName(input);

      return successResponseFactory.single(task);
    }),

  delete: publicProcedure
    .input(BoardIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      await Board.delete(input);

      return successResponseFactory.noData();
    }),
});
