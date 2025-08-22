import Task from "../models/Task.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import {
  CreateTaskSchema,
  UpdateStatusSchema,
  PageQuerySchema,
  BoardIdSchema,
  TaskIdSchema,
} from "./validation.schemas.js";
import type {
  TTask,
  ByCreatedPageParams,
  ByDueDatePageParams,
} from "../util/types.js";
import Pagination from "../util/Pagination.js";
import { publicProcedure, router } from "../trpc/trpc.js";

/*
 * All routes that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * Errors are handled at the top level in `index.ts` with the `app.onError` handler,
 * so try/catch blocks are not needed.
 */

export const tasksRouter = router({
  getAllFromBoard: publicProcedure
    .input(BoardIdSchema)
    .query(async ({ input }) => {
      const allTasks = await Task.getAllFromBoard(input);
      return successResponseFactory.standard(allTasks);
    }),

  getCount: publicProcedure.input(BoardIdSchema).query(async ({ input }) => {
    const numTasks = await Task.getNumTasks(input);
    return successResponseFactory.standard(numTasks);
  }),

  getPage: publicProcedure.input(PageQuerySchema).query(async ({ input }) => {
    const { sortBy, pageSize } = input;

    let page: TTask[];
    let nextCursor: string | null = null;

    // May need refactoring if more sort strategies are added
    switch (sortBy) {
      case "created": {
        let params: ByCreatedPageParams;
        params = Pagination.generateByCreatedParams(input);
        page = await Task.getTasksByCreated(params);

        const nextPageExists = page.length === pageSize;
        if (nextPageExists) {
          const lastTask = page[page.length - 1];
          nextCursor = Pagination.getNextByCreatedCursor(lastTask);
        }
        break;
      }

      case "dueDate": {
        let params: ByDueDatePageParams;
        params = Pagination.generateByDueDateParams(input);
        page = await Task.getTasksByDueDate(params);

        const nextPageExists = page.length === pageSize;
        if (nextPageExists) {
          const lastTask = page[page.length - 1];
          nextCursor = Pagination.getNextByDueDateCursor(lastTask);
        }
        break;
      }
    }

    return successResponseFactory.withMeta(page, { cursor: nextCursor });
  }),

  getById: publicProcedure.input(TaskIdSchema).query(async ({ input }) => {
    const task = await Task.findById(input);
    return successResponseFactory.standard(task);
  }),

  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input }) => {
      const { boardId, title, status, due_date, description } = input;
      const task = await Task.create({
        title,
        status,
        dueDate: due_date,
        description,
        boardId,
      });
      return successResponseFactory.standard(task);
    }),

  updateStatus: publicProcedure
    .input(UpdateStatusSchema)
    .mutation(async ({ input }) => {
      const result = await Task.updateStatus(input);
      return successResponseFactory.standard({ newStatus: result.status });
    }),

  delete: publicProcedure.input(TaskIdSchema).mutation(async ({ input }) => {
    await Task.delete(input);
    return successResponseFactory.noData();
  }),
});
