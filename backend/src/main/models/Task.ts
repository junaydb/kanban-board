import db from "../db/index.js";
import { tasks, taskPositions } from "../db/schema.js";
import { eq, and, desc, asc, count, sql, ilike, inArray } from "drizzle-orm";
import type {
  TTask,
  CreateTaskParams,
  UpdateStatusParams,
  UpdatePositionsParams,
  ByDueDateColParams,
  ByCreatedColParams,
  ByPositionColParams,
  BoardIdParams,
  TaskIdParams,
  TaskCountParams,
} from "../util/types.js";

class Task {
  /**
   * Returns all tasks belonging to this board, grouped by status.
   * Ordered by creation date in descending order.
   */
  static async getAllFromBoard({ boardId }: BoardIdParams) {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(desc(tasks.createdAt));

    // Group by status
    const todo = allTasks.filter((t) => t.status === "TODO");
    const in_progress = allTasks.filter((t) => t.status === "IN_PROGRESS");
    const done = allTasks.filter((t) => t.status === "DONE");

    return { todo, in_progress, done };
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
   * Returns tasks with the given status, ordered by creation date
   * in ascending or descending order depending on `sortOrder`.
   */
  static async getTasksByCreated({
    sortOrder,
    status,
    boardId,
  }: ByCreatedColParams) {
    let result: TTask[];

    switch (sortOrder) {
      case "ASC":
        result = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.boardId, boardId), eq(tasks.status, status)))
          .orderBy(asc(tasks.createdAt), asc(tasks.id));
        break;

      case "DESC":
        result = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.boardId, boardId), eq(tasks.status, status)))
          .orderBy(desc(tasks.createdAt), desc(tasks.id));
        break;
    }

    return result;
  }

  /**
   * Returns tasks with the given status, ordered by due date
   * in ascending or descending order depending on `sortOrder`.
   * NULL due dates are always placed at the end, regardless of sort order.
   */
  static async getTasksByDueDate({
    sortOrder,
    status,
    boardId,
  }: ByDueDateColParams) {
    let result: TTask[];

    switch (sortOrder) {
      case "ASC":
        result = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.boardId, boardId), eq(tasks.status, status)))
          .orderBy(sql`${tasks.dueDate} ASC NULLS LAST`, asc(tasks.id));
        break;

      case "DESC":
        result = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.boardId, boardId), eq(tasks.status, status)))
          .orderBy(sql`${tasks.dueDate} DESC NULLS LAST`, desc(tasks.id));
        break;
    }

    return result;
  }

  /**
   * Returns  tasks ordered by user-defined position.
   * Uses the position arrays stored in the taskPositions table.
   */
  static async getTasksByPosition({ status, boardId }: ByPositionColParams) {
    const [positions] = await db
      .select()
      .from(taskPositions)
      .where(eq(taskPositions.boardId, boardId));

    let posArray: number[];
    switch (status) {
      case "TODO":
        posArray = positions.todoPos;
        break;
      case "IN_PROGRESS":
        posArray = positions.inProgressPos;
        break;
      case "DONE":
        posArray = positions.donePos;
        break;
    }

    const tasksUnordered = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.id, posArray));

    // re-order the tasks so they're in the user-defined order
    const taskMap = new Map(tasksUnordered.map((task) => [task.id, task]));
    const result = posArray.map((id) => taskMap.get(id)!);

    return result;
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
