import Task from "../models/Task.js";
import { successResponseFactory } from "../util/responseWrappers.js";
import {
  CreateTaskSchema,
  UpdateStatusSchema,
  PageQuerySchema,
  BoardIdSchema,
  TaskIdSchema,
  TaskCountSchema,
} from "./_validators.js";
import type {
  TTask,
  ByCreatedPageParams,
  ByDueDatePageParams,
} from "../util/types.js";
import Pagination from "../util/Pagination.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import { verifyBoardOwnershipHandler } from "./_helpers.js";

/*
 * All procedures that take parameters validate those parameters using Zod schemas.
 * Zod throws a `ZodError` when validation fails.
 *
 * All auth logic is handled within procedures that require it.
 *
 * All errors are handled by TRPC via throwing TRPCError with the respective error code.
 */

export const tasksRouter = router({
  getAll: publicProcedure.input(BoardIdSchema).query(async ({ ctx, input }) => {
    await verifyBoardOwnershipHandler(ctx, input);

    const allTasks = await Task.getAll(input);
    if (!allTasks) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tasks not found" });
    }

    return successResponseFactory.standard(allTasks);
  }),

  getCount: publicProcedure
    .input(BoardIdSchema.merge(TaskCountSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const numTasks = await Task.getNumTasks(input);
      return successResponseFactory.standard(numTasks);
    }),

  getPage: publicProcedure
    .input(PageQuerySchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const { sortBy, pageSize } = input;

      let page: TTask[] | null;
      let nextCursor: string | null = null;

      // Lots of repetition, may need refactoring if more sort strategies are added
      switch (sortBy) {
        case "created": {
          let params: ByCreatedPageParams;
          params = Pagination.generateByCreatedParams(input);
          page = await Task.getTasksByCreated(params);

          if (!page) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Tasks not found",
            });
          }

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

          if (!page) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Tasks not found",
            });
          }

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

  getById: publicProcedure
    .input(BoardIdSchema.merge(TaskIdSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const task = await Task.findById(input);
      if (!task) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponseFactory.standard(task);
    }),

  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input }) => {
      const task = await Task.create(input);
      return successResponseFactory.standard(task);
    }),

  updateStatus: publicProcedure
    .input(UpdateStatusSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const result = await Task.updateStatus(input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponseFactory.standard({ newStatus: result.status });
    }),

  delete: publicProcedure
    .input(TaskIdSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardOwnershipHandler(ctx, input);

      const result = await Task.delete(input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponseFactory.standard(result);
    }),
});
