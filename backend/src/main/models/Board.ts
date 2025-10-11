import db from "../db/index.js";
import { boards } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type {
  BoardIdParams,
  InsertBoardParams,
  UpdateBoardNameParams,
} from "../util/types.js";

class Board {
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

    if (currentBoard.length === 0) {
      return null;
    }

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
    const result = await db
      .delete(boards)
      .where(eq(boards.id, boardId))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return boardId;
  }
}

export default Board;
