import Board from "../models/Board.js";
import { BoardIdSchema, BoardTitleSchema } from "./_validators.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { verifyBoardExistenceAndOwnership } from "./_helpers.js";
import { TRPCError } from "@trpc/server";

export const boardsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const allBoards = await Board.getAll({
      userId: ctx.user.id,
    });

    return successResponseFactory.array({ boards: allBoards });
  }),

  // TODO: set a board count limit. user's should only be able to create a certain number of boards.
  create: publicProcedure
    .input(BoardTitleSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
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

      return successResponseFactory.single(result);
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
        return successResponseFactory.single({
          message: "Identical title received. No action taken.",
        });
      }

      return successResponseFactory.single(result);
    }),

  delete: publicProcedure
    .input(BoardIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      await Board.delete(input);

      return successResponseFactory.noData();
    }),
});
