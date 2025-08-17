import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";
import { eq, and, lt, gt, desc, asc, count } from "drizzle-orm";
import type { ICreateTask, TaskStatus, SortOrder } from "../util/types.js";
import { TaskNotFoundError } from "../util/errors.js";

class Task {
  /**
   * Returns all tasks belonging to this board from the database, ordered by creation date in descending order.
   */
  static async getAllFromBoard(boardId: number) {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(boardId, tasks.boardId))
      .orderBy(desc(tasks.createdAt));

    if (allTasks.length === 0) {
      throw new TaskNotFoundError();
    }

    return allTasks;
  }

  /**
   * Returns the number of tasks in the database.
   */
  static async getNumTasks() {
    const result = await db.select({ count: count() }).from(tasks);
    return result[0].count;
  }

  /**
   * Returns the next page of size `pageSize` from the database,
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by creation date in ascending or descending order, based on `sortOrder`.
   */
  static async getTasksByCreated(
    sortOrder: SortOrder,
    pageParams: IPaginationParams,
  ) {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.status, pageParams.status))
      .limit(pageParams.pageSize);

    if (pageParams.prevId && pageParams.prevCreatedAt) {
      if (sortOrder === "DESC") {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            lt(tasks.createdAt, pageParams.prevCreatedAt),
          ),
        );
      } else {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            gt(tasks.createdAt, pageParams.prevCreatedAt),
          ),
        );
      }
    }

    if (sortOrder === "DESC") {
      query = query.orderBy(desc(tasks.createdAt));
    } else {
      query = query.orderBy(asc(tasks.createdAt));
    }

    const page = await query;

    if (page.length === 0) {
      throw new TaskNotFoundError();
    }

    return page;
  }

  /**
   * Returns the next page of size `pageSize` from the database,
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by creation date in ascending or descending order, based on `sortOrder`.
   *
   * Does not throw
   */
  static async getTasksByCreatedSafe(
    sortOrder: SortOrder,
    pageParams: IPaginationParams,
  ) {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.status, pageParams.status))
      .limit(pageParams.pageSize);

    if (pageParams.prevId && pageParams.prevCreatedAt) {
      if (sortOrder === "DESC") {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            lt(tasks.createdAt, pageParams.prevCreatedAt),
          ),
        );
      } else {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            gt(tasks.createdAt, pageParams.prevCreatedAt),
          ),
        );
      }
    }

    if (sortOrder === "DESC") {
      query = query.orderBy(desc(tasks.createdAt));
    } else {
      query = query.orderBy(asc(tasks.createdAt));
    }

    return await query;
  }

  /**
   * Returns the next page of size `pageSize` from the database,
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by due date in ascending or descending order, based on `sortOrder`.
   */
  static async getTasksByDueDate(
    sortOrder: SortOrder,
    pageParams: IPaginationParams,
  ) {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.status, pageParams.status))
      .limit(pageParams.pageSize);

    if (pageParams.prevId && pageParams.prevDueDate) {
      if (sortOrder === "DESC") {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            lt(tasks.dueDate, pageParams.prevDueDate),
          ),
        );
      } else {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            gt(tasks.dueDate, pageParams.prevDueDate),
          ),
        );
      }
    }

    if (sortOrder === "DESC") {
      query = query.orderBy(desc(tasks.dueDate));
    } else {
      query = query.orderBy(asc(tasks.dueDate));
    }

    const page = await query;

    if (page.length === 0) {
      throw new TaskNotFoundError();
    }

    return page;
  }

  /**
   * Returns the next page of size `pageSize` from the database,
   * where the tasks have a status equal to `pageParams.status`,
   * ordered by due date in ascending or descending order, based on `sortOrder`.
   *
   * Does not throw
   */
  static async getTasksByDueDateSafe(
    sortOrder: SortOrder,
    pageParams: IPaginationParams,
  ) {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.status, pageParams.status))
      .limit(pageParams.pageSize);

    if (pageParams.prevId && pageParams.prevDueDate) {
      if (sortOrder === "DESC") {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            lt(tasks.dueDate, pageParams.prevDueDate),
          ),
        );
      } else {
        query = query.where(
          and(
            eq(tasks.status, pageParams.status),
            gt(tasks.dueDate, pageParams.prevDueDate),
          ),
        );
      }
    }

    if (sortOrder === "DESC") {
      query = query.orderBy(desc(tasks.dueDate));
    } else {
      query = query.orderBy(asc(tasks.dueDate));
    }

    return await query;
  }

  /**
   * Returns the task with id `id` from the database.
   */
  static async findById(id: number) {
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (task.length === 0) {
      throw new TaskNotFoundError();
    }

    return task[0];
  }

  /**
   * Updates the status of task with id `id` in the database and returns the
   * updated status.
   */
  static async updateStatus(
    params: IUpdateTaskStatus,
  ): Promise<{ status: TaskStatus }> {
    const result = await db
      .update(tasks)
      .set({ status: params.status })
      .where(eq(tasks.id, params.id))
      .returning({ status: tasks.status });

    if (result.length === 0) {
      throw new TaskNotFoundError();
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
      throw new TaskNotFoundError();
    }

    return 1;
  }

  /**
   * Inserts the task into the database and returns the inserted task.
   */
  static async save(params: ICreateTask) {
    const result = await db.insert(tasks).values(params).returning();
    return result[0];
  }
}

export default Task;

