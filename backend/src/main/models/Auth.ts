import db from "../db/index.js";
import { boards } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { VerifyBoardOwnershipParams } from "../util/types.js";

class Auth {
  static async verifyBoardOwnership({
    userId,
    boardId,
  }: VerifyBoardOwnershipParams) {
    const result = await db
      .select()
      .from(boards)
      // Check if the row that has this board id and this user id exists,
      // if it doesn't, then userId does not own board with boardId.
      .where(and(eq(boards.userId, userId), eq(boards.id, boardId)))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    return true;
  }
}

export default Auth;
