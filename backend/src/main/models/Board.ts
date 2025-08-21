import db from "../db/index.js";
import { boards } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type {
  BoardIdParams,
  InsertBoardParams,
  UpdateBoardNameParams,
} from "../util/types.js";

class Board {
  static async create(params: InsertBoardParams) {
    const board = await db.insert(boards).values(params).returning();
    return board;
  }

  static async updateName({ title, boardId }: UpdateBoardNameParams) {
    await db.update(boards).set({ title: title }).where(eq(boards.id, boardId));
    return title;
  }

  static async delete({ boardId }: BoardIdParams) {
    await db.delete(boards).where(eq(boards.id, boardId));
    return boardId;
  }
}

export default Board;
