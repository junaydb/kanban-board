import db from "../db/index.js";
import { tasks, boards, session } from "../db/schema.js";
import { SessionError, OwnershipError, NotFoundError } from "../util/errors.js";
import { eq, and } from "drizzle-orm";

class Auth {
  static async getLoggedInUser(sessionToken: string) {
    const userId = await db
      .select({ userId: session.id })
      .from(session)
      .where(eq(session.token, sessionToken))
      .limit(1)
      .then((res) => {
        // I don't think this path is even possible, but just in case...
        if (res.length === 0) {
          throw new SessionError();
        }
        return res[0].userId;
      });

    return userId;
  }

  static async verifyBoardOwnership(userId: string, boardId: number) {
    await db
      .select()
      .from(boards)
      // Check if the row that has this board id and this user id exists,
      // if it doesn't, then userId does not own board with boardId.
      .where(and(eq(boards.userId, userId), eq(boards.id, boardId)))
      .limit(1)
      .then((res) => {
        if (res.length === 0) {
          throw new OwnershipError(userId, "board", boardId);
        }
      });

    return true;
  }

  static async verifyTaskOwnership(userId: string, taskId: number) {
    // Get the boardId of the board this task belongs to
    const boardId = await db
      .select({ boardId: tasks.boardId })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .then((res) => {
        if (res.length === 0) {
          throw new NotFoundError(`Task ${taskId}`);
        }
        return res[0].boardId;
      });

    return Auth.verifyBoardOwnership(userId, boardId);
  }
}

export default Auth;
