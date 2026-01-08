import Task from "../models/Task.js";
import { successResponse } from "../util/responseWrappers.js";
import { z } from "zod";
import {
  CreateTaskSchema,
  UpdateStatusSchema,
  UpdatePositionsSchema,
  PageQuerySchema,
  BoardIdSchema,
  TaskIdSchema,
  TaskCountSchema,
} from "./_validators.js";
import type { TTask } from "../util/types.js";
import { Pagination } from "../util/Pagination.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import { verifyBoardExistenceAndOwnership } from "./_helpers.js";

export const tasksRouter = router({
  getAllFromBoard: publicProcedure
    .input(BoardIdSchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const allTasks = await Task.getAllFromBoard(input);

      return successResponse.array({ tasks: allTasks });
    }),

  getCount: publicProcedure
    .input(BoardIdSchema.merge(TaskCountSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const numTasks = await Task.getNumTasks(input);
      return successResponse.single(numTasks);
    }),

  getPage: publicProcedure
    .input(PageQuerySchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const { sortBy, pageSize } = input;

      let page: TTask[] | null;
      let nextCursor: string | null = null;

      // Lots of repetition, may need refactoring if more sort strategies are added
      switch (sortBy) {
        case "created": {
          const params = Pagination.created.generateParams(input);
          page = await Task.getTasksByCreated(params);

          const nextPageExists = page.length === pageSize;
          if (nextPageExists) {
            const lastTask = page[page.length - 1];
            nextCursor = Pagination.created.getNextCursor(lastTask);
          }
          break;
        }

        case "dueDate": {
          const params = Pagination.dueDate.generateParams(input);
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
            nextCursor = Pagination.dueDate.getNextCursor(lastTask);
          }
          break;
        }

        case "position": {
          const params = Pagination.position.generateParams(input);
          page = await Task.getTasksByPosition(params);

          if (!page) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Tasks not found",
            });
          }

          const nextPageExists = page.length === pageSize;
          if (nextPageExists) {
            nextCursor = Pagination.position.getNextCursor(
              pageSize,
              input.cursor,
            );
          }
          break;
        }
      }

      return successResponse.arrayWithMeta(
        { tasks: page },
        { cursor: nextCursor },
      );
    }),

  getById: publicProcedure
    .input(BoardIdSchema.merge(TaskIdSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const task = await Task.findById(input);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponse.single(task);
    }),

  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const task = await Task.create(input);

      return successResponse.single(task);
    }),

  updateStatus: publicProcedure
    .input(UpdateStatusSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const result = await Task.updateStatus(input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponse.single({ newStatus: result.status });
    }),

  delete: publicProcedure
    .input(TaskIdSchema.merge(BoardIdSchema))
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const result = await Task.delete(input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.taskId} not found`,
        });
      }

      return successResponse.single(result);
    }),

  search: publicProcedure
    .input(BoardIdSchema.merge(z.object({ query: z.string() })))
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const results = await Task.search(input);

      return successResponse.array({ tasks: results });
    }),

  updatePositions: publicProcedure
    .input(UpdatePositionsSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      await Task.updatePositions(input);

      return successResponse.single({ success: true });
    }),
});
