import db from "../db/index.js";
import { boards } from "../db/schema.js";
import { eq } from "drizzle-orm";
import Auth from "./Auth.js";
import type { InsertBoardParams } from "../util/types.js";

class Board {
  static async create(board: InsertBoardParams) {
    await db.insert(boards).values(board);
    return board;
  }

  static async updateName(title: string, userId: string, boardId: number) {
    await Auth.verifyBoardOwnership(userId, boardId);
    await db.update(boards).set({ title: title }).where(eq(boards.id, boardId));
    return title;
  }

  static async delete(userId: string, boardId: number) {
    await Auth.verifyBoardOwnership(userId, boardId);
    await db.delete(boards).where(eq(boards.id, boardId));
    return boardId;
  }
}

export default Board;
