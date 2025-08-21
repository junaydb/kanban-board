import Task from "../../models/Task.js";
import { successResponse } from "../../util/responseWrappers.js";
import {
  IdSchema,
  CreateTaskSchema,
  UpdateStatusSchema,
  PageQuerySchema,
} from "./tasks.schemas.js";
import type {
  TTask,
  ByCreatedPageParams,
  ByDueDatePageParams,
} from "../../util/types.js";
import Pagination from "../../util/Pagination.js";
import { publicProcedure, router } from "../../trpc/trpc.js";

/*
 * All routes that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * Errors are handled at the top level in `index.ts` with the `app.onError` handler,
 * so try/catch blocks are not needed.
 */

export const tasksRouter = router({
  getAllFromBoard: publicProcedure.input(IdSchema).query(async ({ input }) => {
    const boardId = input;
    const allTasks = await Task.getAllFromBoard(sessionToken, boardId);
    return successResponse.array(allTasks);
  }),

  getCount: publicProcedure.input(IdSchema).query(async ({ input }) => {
    const boardId = input;
    const numTasks = await Task.getNumTasks(sessionToken, boardId);
    return successResponse.count(numTasks);
  }),

  getPage: publicProcedure.input(PageQuerySchema).query(async ({ input }) => {
    const { sortBy, pageSize } = input;

    let page: TTask[];
    let nextCursor: string | null = null;

    if (sortBy === "created") {
      let params: ByCreatedPageParams;
      params = Pagination.generateByCreatedParams(input);
      page = await Task.getTasksByCreated(sessionToken, params);

      const nextPageExists = page.length === pageSize;
      if (nextPageExists) {
        const lastTask = page[page.length - 1];
        nextCursor = Pagination.getNextByCreatedCursor(lastTask);
      }
    } else {
      let params: ByDueDatePageParams;
      params = Pagination.generateByDueDateParams(input);
      page = await Task.getTasksByDueDate(sessionToken, params);

      const nextPageExists = page.length === pageSize;
      if (nextPageExists) {
        const lastTask = page[page.length - 1];
        nextCursor = Pagination.getNextByDueDateCursor(lastTask);
      }
    }

    return successResponse.withMeta(page, { cursor: nextCursor });
  }),

  getById: publicProcedure.input(IdSchema).query(async ({ input }) => {
    const id = input;
    const task = await Task.findById(id);
    return successResponse.single(task);
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
      return successResponse.single(task);
    }),

  updateStatus: publicProcedure
    .input(UpdateStatusSchema)
    .mutation(async ({ input }) => {
      const result = await Task.updateStatus(sessionToken, input);
      return successResponse.newStatus(result.status);
    }),

  delete: publicProcedure.input(IdSchema).mutation(async ({ input }) => {
    const id = input;
    await Task.delete(id);
    return successResponse.empty();
  }),
});
