import db from "../db/index.js";
import { tasks, taskPositions } from "../db/schema.js";
import { eq, and, desc, asc, count, sql, ilike } from "drizzle-orm";
import type {
  GetAllFromBoardParams,
  CreateTaskParams,
  UpdateStatusParams,
  UpdatePositionsParams,
  BoardIdParams,
  TaskIdParams,
  TaskCountParams,
} from "../util/types.js";

class Task {
  /**
   * Returns all tasks belonging to this board, grouped by status.
   * Optionally sorted by creation date, due date, or user-defined position (default).
   */
  static async getAllFromBoard({
    boardId,
    sortBy,
    sortOrder,
  }: GetAllFromBoardParams) {
    if (sortBy === "created") {
      const allTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.boardId, boardId))
        .orderBy(
          sortOrder === "ASC" ? asc(tasks.createdAt) : desc(tasks.createdAt),
          sortOrder === "ASC" ? asc(tasks.id) : desc(tasks.id),
        );

      return {
        todo: allTasks.filter((t) => t.status === "TODO"),
        in_progress: allTasks.filter((t) => t.status === "IN_PROGRESS"),
        done: allTasks.filter((t) => t.status === "DONE"),
      };
    }

    if (sortBy === "dueDate") {
      const allTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.boardId, boardId))
        .orderBy(
          sortOrder === "ASC"
            ? sql`${tasks.dueDate} ASC NULLS LAST`
            : sql`${tasks.dueDate} DESC NULLS LAST`,
          sortOrder === "ASC" ? asc(tasks.id) : desc(tasks.id),
        );

      return {
        todo: allTasks.filter((t) => t.status === "TODO"),
        in_progress: allTasks.filter((t) => t.status === "IN_PROGRESS"),
        done: allTasks.filter((t) => t.status === "DONE"),
      };
    }

    if (sortBy === "position") {
      const [positions] = await db
        .select()
        .from(taskPositions)
        .where(eq(taskPositions.boardId, boardId));

      const allTasksUnordered = await db
        .select()
        .from(tasks)
        .where(eq(tasks.boardId, boardId));

      const taskMap = new Map(allTasksUnordered.map((t) => [t.id, t]));
      const orderByPos = (posArray: number[]) =>
        posArray.map((id) => taskMap.get(id)!).filter(Boolean);

      return {
        todo: orderByPos(positions.todoPos),
        in_progress: orderByPos(positions.inProgressPos),
        done: orderByPos(positions.donePos),
      };
    }
  }

  /**
   * Returns the total number of tasks for this board.
   */
  static async getNumTasks({ boardId, status }: TaskCountParams) {
    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.boardId, boardId),
          status ? eq(tasks.status, status) : undefined,
        ),
      );

    return result[0].count;
  }

  /**
   * Returns the task with id `id` from the database.
   */
  static async findById({ taskId }: TaskIdParams) {
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task.length === 0) {
      return null;
    }

    return task[0];
  }

  /**
   * Updates the status of task with id `id` in the database and returns the
   * updated status.
   */
  static async updateStatus({ taskId, newStatus }: UpdateStatusParams) {
    const result = await db
      .update(tasks)
      .set({ status: newStatus })
      .where(eq(tasks.id, taskId))
      .returning({ status: tasks.status });

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  /**
   * Deletes task with id `id` from the database. Returns 1 to indicate success.
   */
  static async delete({ taskId }: TaskIdParams) {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  /**
   * Inserts the task into the database and returns the inserted task.
   */
  static async create(params: CreateTaskParams) {
    const result = await db.insert(tasks).values(params).returning();
    return result[0];
  }

  /**
   * Returns all tasks in the board whose title begins with the given query string.
   */
  static async search({ boardId, query }: BoardIdParams & { query: string }) {
    const results = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.boardId, boardId), ilike(tasks.title, `${query}%`)))
      .orderBy(desc(tasks.createdAt));

    return results;
  }

  /**
   * Updates the position arrays for a board.
   */
  static async updatePositions({
    boardId,
    todoPos,
    inProgressPos,
    donePos,
  }: UpdatePositionsParams) {
    await db
      .update(taskPositions)
      .set({
        todoPos,
        inProgressPos,
        donePos,
      })
      .where(eq(taskPositions.boardId, boardId));
  }
}

export default Task;
