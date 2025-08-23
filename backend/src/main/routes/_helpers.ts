import type { HonoContext } from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import Auth from "../models/Auth.js";
import type { BoardIdParams } from "../util/types.js";

// Helpers for logic that gets repeated in multiple routes

export async function verifyBoardOwnershipHandler(
  ctx: HonoContext,
  { boardId }: BoardIdParams,
) {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
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
