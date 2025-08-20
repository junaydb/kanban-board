import db from "../db/index.js";
import Auth from "./Auth.js";
import { tasks } from "../db/schema.js";
import { eq, and, lt, gt, desc, asc, count, or } from "drizzle-orm";
import type {
  TTask,
  SortOrder,
  CreateTaskParams,
  UpdateStatusParams,
  ByDueDatePaginationParams,
  ByCreatedPaginationParams,
} from "../util/types.js";
import { NotFoundError } from "../util/errors.js";

class Task {
  /**
   * Returns all tasks belonging to this board, ordered by creation date in descending order.
   */
  static async getAllFromBoard(sessionToken: string, boardId: number) {
    await Auth.verifyBoardOwnership(sessionToken, boardId);

    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(desc(tasks.createdAt));

    if (allTasks.length === 0) {
      throw new NotFoundError("Tasks");
    }

    return allTasks;
  }

  /**
   * Returns the total number of tasks for this board.
   */
  static async getNumTasks(sessionToken: string, boardId: number) {
    await Auth.verifyBoardOwnership(sessionToken, boardId);

    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.boardId, boardId));

    return result[0].count;
  }

  /**
   * Returns the next page of size `pageSize` from the database
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by creation date in ascending or descending order, depending on `sortOrder`.
   */
  static async getTasksByCreated(
    sessionToken: string,
    boardId: number,
    sortOrder: SortOrder,
    { status, pageSize, cursor }: ByCreatedPaginationParams,
  ) {
    await Auth.verifyBoardOwnership(sessionToken, boardId);

    let page: TTask[];

    if (sortOrder === "ASC") {
      page = await db
        .select()
        .from(tasks)
        .where(
          and(
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
    } else {
      page = await db
        .select()
        .from(tasks)
        .where(
          and(
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
    }

    if (page.length === 0) {
      throw new NotFoundError("Tasks");
    }

    return page;
  }

  /**
   * Returns the next page of size `pageSize` from the database
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by due date in ascending or descending order, depending on `sortOrder`.
   */
  static async getTasksByDueDate(
    sessionToken: string,
    boardId: number,
    sortOrder: SortOrder,
    { status, pageSize, cursor }: ByDueDatePaginationParams,
  ) {
    await Auth.verifyBoardOwnership(sessionToken, boardId);

    let page: TTask[];

    if (sortOrder === "ASC") {
      page = await db
        .select()
        .from(tasks)
        .where(
          and(
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
    } else {
      page = await db
        .select()
        .from(tasks)
        .where(
          and(
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
    }

    return page;
  }

  /**
   * Returns the task with id `id` from the database.
   */
  static async findById(id: number) {
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (task.length === 0) {
      throw new NotFoundError(`Task ${id}`);
    }

    return task[0];
  }

  /**
   * Updates the status of task with id `id` in the database and returns the
   * updated status.
   */
  static async updateStatus(
    sessionToken: string,
    boardId: number,
    params: UpdateStatusParams,
  ) {
    await Auth.verifyBoardOwnership(sessionToken, boardId);

    const result = await db
      .update(tasks)
      .set({ status: params.newStatus })
      .where(eq(tasks.id, params.id))
      .returning({ status: tasks.status });

    if (result.length === 0) {
      throw new NotFoundError(`Task ${params.id}`);
    }

    return result[0];
  }

  /**
   * Deletes task with id `id` from the database. Returns 1 to indicate success.
   */
  static async delete(id: number) {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    if (result.length === 0) {
      throw new NotFoundError(`Task ${id}`);
    }

    return 1;
  }

  /**
   * Inserts the task into the database and returns the inserted task.
   */
  static async save(params: CreateTaskParams) {
    const result = await db.insert(tasks).values(params).returning();
    return result[0];
  }
}

export default Task;
