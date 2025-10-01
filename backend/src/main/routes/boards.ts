import Board from "../models/Board.js";
import { BoardIdSchema, BoardTitleSchema } from "./_validators.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { verifyBoardOwnershipHandler } from "./_helpers.js";

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
