import db from "../db/index.js";
import { tasks } from "../db/schema.js";
import { eq, and, lt, gt, desc, asc, count, or } from "drizzle-orm";
import type {
  TTask,
  CreateTaskParams,
  UpdateStatusParams,
  ByDueDatePageParams,
  ByCreatedPageParams,
  BoardIdParams,
  TaskIdParams,
  TaskCountParams,
} from "../util/types.js";

class Task {
  /**
   * Returns all tasks belonging to this board, ordered by creation date in descending order.
   */
  static async getAll({ boardId }: BoardIdParams) {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(desc(tasks.createdAt));

    if (allTasks.length === 0) {
      return null;
    }

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

    if (page.length === 0) {
      return null;
    }

    return page;
  }

  /**
   * Returns the next page of size `pageSize` from the database
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by due date in ascending or descending order, depending on `sortOrder`.
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
                ? or(
                    gt(tasks.dueDate, cursor.prevDueDate),
                    and(
                      eq(tasks.dueDate, cursor.prevDueDate),
                      gt(tasks.id, cursor.prevId),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(asc(tasks.dueDate), asc(tasks.id))
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
                    lt(tasks.dueDate, cursor.prevDueDate),
                    and(
                      eq(tasks.dueDate, cursor.prevDueDate),
                      lt(tasks.id, cursor.prevId),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(tasks.dueDate), desc(tasks.id))
          .limit(pageSize);
        break;
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
}

export default Task;
