import { TRPCError } from "@trpc/server";
import Auth from "../models/Auth.js";
import Board from "../models/Board.js";
import type { BoardIdParams } from "../util/types.js";
import type { ExpressContext } from "../trpc/trpc.js";

// Helpers for logic that gets repeated in multiple routes

export async function verifyBoardExistenceAndOwnership(
  ctx: ExpressContext,
  { boardId }: BoardIdParams,
) {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const boardExists = await Board.checkExists({ boardId });
  if (!boardExists) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Board with id ${boardId} not found`,
    });
  }

  const userOwnsBoard = await Auth.verifyBoardOwnership({
    userId: ctx.user.id,
    boardId: boardId,
  });

  if (!userOwnsBoard) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `User does not own requested resource`,
    });
  }
}
