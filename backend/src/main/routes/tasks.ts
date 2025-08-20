import Task from "../models/Task.js";
import { successResponse } from "../util/responseWrappers.js";
import {
  CreateTaskSchema,
  UpdateStatusSchema,
  PaginationQuerySchema,
} from "./tasks.schemas.js";
import type { PaginationParams } from "../util/types.js";
import * as pagination from "../util/pagination.js";
import { publicProcedure, router } from "../trpc/trpc.js";

/*
 * All routes that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * Errors are handled at the top level in `index.ts` with the `app.onError` handler,
 * so try/catch blocks are not needed.
 *
 * When validation fails, a helpful error message (sourced from the given Zod schema)
 * is sent to the browser, in the standard response format defined in `./util/responseWrappers.ts`.
 */

export const tasksRouter = router({
  getAllFromBoard: publicProcedure.query(async () => {
    const allTasks = await Task.getAllFromBoard();
    return successResponse.array(allTasks);
  }),

  getCount: publicProcedure.query(async () => {
    const numTasks = await Task.getNumTasks();
    return successResponse.count(numTasks);
  }),

  getPage: publicProcedure
    .input(PaginationQuerySchema)
    .query(async ({ input }) => {
      const { status, sortBy, sortOrder, pageSize, cursor } = input;

      const sortStrat = pagination.strategies[sortBy];

      let params: PaginationParams;

      if (!cursor) {
        params = { status, pageSize };
      } else {
        const decodedCursor = pagination.decodeCursor(cursor);
        const validatedCursor = sortStrat.cursorSchema.parse(decodedCursor);
        params = { ...validatedCursor, status, pageSize };
      }

      const page = await sortStrat.getTasks(sortOrder, params);

      const nextPageExists = page.length === pageSize;
      let nextCursor: string | null = null;
      if (nextPageExists) {
        const lastTask = page[page.length - 1];
        const cursor = sortStrat.getNextCursor(lastTask);
        nextCursor = pagination.encodeCursor(cursor);
      }

      return successResponse.withMeta(page, { cursor: nextCursor });
    }),

  getById: publicProcedure.input(TaskIdSchema).query(async ({ input }) => {
    const { id } = input;
    const task = await Task.findById(id);
    return successResponse.single(task);
  }),

  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input }) => {
      const { title, status, due_date, description } = input;
      // For now, hardcode boardId to 1 until we implement boards
      const task = await Task.save({
        title,
        status,
        dueDate: due_date,
        description,
        boardId: 1,
      });
      return successResponse.single(task);
    }),

  updateStatus: publicProcedure
    .input(TaskIdSchema.merge(UpdateStatusSchema))
    .mutation(async ({ input }) => {
      const { id, status } = input;
      const result = await Task.updateStatus({ id, status });
      return successResponse.newStatus(result.status);
    }),

  delete: publicProcedure.input(TaskIdSchema).mutation(async ({ input }) => {
    const { id } = input;
    await Task.delete(id);
    return successResponse.empty();
  }),
});
