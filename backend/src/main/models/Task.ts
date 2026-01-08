import db from "../db/index.js";
import { tasks, taskPositions } from "../db/schema.js";
import {
  eq,
  and,
  lt,
  gt,
  desc,
  asc,
  count,
  or,
  sql,
  ilike,
  inArray,
} from "drizzle-orm";
import type {
  TTask,
  CreateTaskParams,
  UpdateStatusParams,
  UpdatePositionsParams,
  ByDueDatePageParams,
  ByCreatedPageParams,
  ByPositionPageParams,
  BoardIdParams,
  TaskIdParams,
  TaskCountParams,
} from "../util/types.js";

class Task {
  /**
   * Returns all tasks belonging to this board, ordered by creation date in descending order.
   */
  static async getAllFromBoard({ boardId }: BoardIdParams) {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(desc(tasks.createdAt));

    return allTasks;
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
   * Returns the next page of size `pageSize` from the database
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by creation date in ascending or descending order, depending on `sortOrder`.
   */
  static async getTasksByCreated({
    sortOrder,
    status,
    pageSize,
    cursor,
    boardId,
  }: ByCreatedPageParams) {
    let page: TTask[];

    switch (sortOrder) {
      case "ASC":
        page = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.boardId, boardId),
              eq(tasks.status, status),
              cursor
                ? or(
                    gt(tasks.createdAt, cursor.prevCreatedAt),
                    and(
                      eq(tasks.createdAt, cursor.prevCreatedAt),
                      gt(tasks.id, cursor.prevId),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(asc(tasks.createdAt), asc(tasks.id))
          .limit(pageSize);
        break;

      case "DESC":
        page = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.boardId, boardId),
              eq(tasks.status, status),
              cursor
                ? or(
                    lt(tasks.createdAt, cursor.prevCreatedAt),
                    and(
                      eq(tasks.createdAt, cursor.prevCreatedAt),
                      lt(tasks.id, cursor.prevId),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(tasks.createdAt), desc(tasks.id))
          .limit(pageSize);
        break;
    }

    return page;
  }

  /**
   * Returns the next page of size `pageSize` from the database
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by due date in ascending or descending order, depending on `sortOrder`.
   * NULL due dates are always placed at the end, regardless of sort order.
   */
  static async getTasksByDueDate({
    sortOrder,
    status,
    pageSize,
    cursor,
    boardId,
  }: ByDueDatePageParams) {
    let page: TTask[];

    switch (sortOrder) {
      case "ASC":
        page = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.boardId, boardId),
              eq(tasks.status, status),
              cursor
                ? !cursor.prevDueDate
                  ? and(
                      sql`${tasks.dueDate} IS NULL`,
                      gt(tasks.id, cursor.prevId),
                    )
                  : or(
                      gt(tasks.dueDate, cursor.prevDueDate),
                      and(
                        eq(tasks.dueDate, cursor.prevDueDate),
                        gt(tasks.id, cursor.prevId),
                      ),
                      sql`${tasks.dueDate} IS NULL`,
                    )
                : undefined,
            ),
          )
          .orderBy(sql`${tasks.dueDate} ASC NULLS LAST`, asc(tasks.id))
          .limit(pageSize);
        break;

      case "DESC":
        page = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.boardId, boardId),
              eq(tasks.status, status),
              cursor
                ? !cursor.prevDueDate
                  ? and(
                      sql`${tasks.dueDate} IS NULL`,
                      lt(tasks.id, cursor.prevId),
                    )
                  : or(
                      lt(tasks.dueDate, cursor.prevDueDate),
                      and(
                        eq(tasks.dueDate, cursor.prevDueDate),
                        lt(tasks.id, cursor.prevId),
                      ),
                      sql`${tasks.dueDate} IS NULL`,
                    )
                : undefined,
            ),
          )
          .orderBy(sql`${tasks.dueDate} DESC NULLS LAST`, desc(tasks.id))
          .limit(pageSize);
        break;
    }

    if (page.length === 0) {
      return null;
    }

    return page;
  }

  /**
   * Returns a page of tasks ordered by user-defined position.
   * Uses the position arrays stored in the taskPositions table.
   */
  static async getTasksByPosition({
    status,
    pageSize,
    cursor,
    boardId,
  }: ByPositionPageParams) {
    const [positions] = await db
      .select()
      .from(taskPositions)
      .where(eq(taskPositions.boardId, boardId));

    if (!positions) {
      return null;
    }

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

    const startIndex = cursor ?? 0;
    const taskIds = posArray.slice(startIndex, startIndex + pageSize);

    const tasksUnordered = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.id, taskIds));

    // re-order the tasks so they're in the user-defined order
    const taskMap = new Map(tasksUnordered.map((task) => [task.id, task]));
    let page = taskIds.map((id) => taskMap.get(id)!);

    if (!page || page.length === 0) {
      return null;
    }

    return page;
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
