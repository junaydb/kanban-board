import Board from "../models/Board.js";
import { BoardIdSchema, BoardTitleSchema } from "./_validators.js";
import { successResponse } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { verifyBoardExistenceAndOwnership } from "./_helpers.js";
import { TRPCError } from "@trpc/server";

const MAX_BOARD_COUNT = 10;

export const boardsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const allBoards = await Board.getAll({
      userId: ctx.user.id,
    });

    const boardCount = await Board.getNumBoards({
      userId: ctx.user.id,
    });

    return successResponse.arrayWithMeta(
      {
        boards: allBoards,
      },
      {
        boardCount: boardCount,
        boardCountLimit: MAX_BOARD_COUNT,
      },
    );
  }),

  lookup: publicProcedure.input(BoardIdSchema).query(async ({ ctx, input }) => {
    await verifyBoardExistenceAndOwnership(ctx, input);

    return successResponse.single({});
  }),

  create: publicProcedure
    .input(BoardTitleSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const userBoardCount = await Board.getNumBoards({ userId: ctx.user.id });

      if (userBoardCount >= MAX_BOARD_COUNT) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Maximum board limit reached. You can create up to ${MAX_BOARD_COUNT} boards.`,
        });
      }

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

      return successResponse.single(result);
    }),

  updateTitle: publicProcedure
    .input(BoardTitleSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const result = await Board.updateTitle(input);

      if (result === "DUPLICATE") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another board with this name already exists.",
        });
      }

      if (result === "NO_OP") {
        return successResponse.single({
          message: "Identical title received. No action taken.",
        });
      }

      return successResponse.single(result);
    }),

  delete: publicProcedure
    .input(BoardIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const result = await Board.delete(input);

      return successResponse.single(result);
    }),
});
