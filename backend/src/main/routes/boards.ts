import Board from "../models/Board.js";
import { BoardIdSchema, BoardTitleSchema } from "./_validators.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { verifyBoardOwnershipHandler } from "./_helpers.js";
import { TRPCError } from "@trpc/server";

export const boardsRouter = router({
  create: publicProcedure
    .input(BoardTitleSchema.merge(BoardIdSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const result = await Board.create({
        userId: ctx.user!.id,
        title: input.title,
      });

      if (result === "DUPLICATE") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another board with this name already exists.",
        });
      }

      return successResponseFactory.single(result);
    }),

  updateTitle: publicProcedure
    .input(BoardTitleSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const result = await Board.updateTitle(input);

      if (result === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found.",
        });
      }

      if (result === "DUPLICATE") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another board with this name already exists.",
        });
      }

      if (result === "NO_OP") {
        return successResponseFactory.single({
          message: "Identical title received. No action taken.",
        });
      }

      return successResponseFactory.single(result);
    }),

  delete: publicProcedure
    .input(BoardIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const result = await Board.delete(input);

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found.",
        });
      }

      return successResponseFactory.noData();
    }),
});
