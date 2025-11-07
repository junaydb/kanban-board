import db from "../db/index.js";
import { boards } from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import type {
  BoardIdParams,
  InsertBoardParams,
  UpdateBoardNameParams,
  UserIdParams,
} from "../util/types.js";

class Board {
  static async getAll({ userId }: UserIdParams) {
    const allBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId));

    return allBoards;
  }

  static async checkExists({ boardId }: BoardIdParams) {
    const exists = await db.select().from(boards).where(eq(boards.id, boardId));

    if (exists.length === 0) {
      return false;
    }

    return true;
  }

  static async getNumBoards({ userId }: UserIdParams) {
    const result = await db
      .select({ count: count() })
      .from(boards)
      .where(eq(boards.userId, userId));

    return result[0].count;
  }

  static async create(params: InsertBoardParams) {
    const titleExists = await db
      .select()
      .from(boards)
      .where(
        and(eq(boards.title, params.title), eq(boards.userId, params.userId)),
      )
      .limit(1);

    if (titleExists.length > 0) {
      return "DUPLICATE";
    }

    const board = await db.insert(boards).values(params).returning();

    return board[0];
  }

  static async updateTitle({ title, boardId }: UpdateBoardNameParams) {
    const currentBoard = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1);

    if (currentBoard[0].title === title) {
      return "NO_OP";
    }

    // Check if another board with this title exists for the same user
    const duplicateBoard = await db
      .select()
      .from(boards)
      .where(
        and(eq(boards.title, title), eq(boards.userId, currentBoard[0].userId)),
      )
      .limit(1);

    if (duplicateBoard.length > 0) {
      return "DUPLICATE";
    }

    const board = await db
      .update(boards)
      .set({ title })
      .where(eq(boards.id, boardId))
      .returning();

    return board[0];
  }

  static async delete({ boardId }: BoardIdParams) {
    const deletedBoard = await db
      .delete(boards)
      .where(eq(boards.id, boardId))
      .returning({ deletedId: boards.id, deletedTitle: boards.title });

    return deletedBoard[0];
  }
}

export default Board;
