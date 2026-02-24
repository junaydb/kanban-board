import Task from "../models/Task.js";
import { successResponse } from "../util/responseWrappers.js";
import { z } from "zod";
import {
  CreateTaskSchema,
  UpdateStatusSchema,
  UpdatePositionsSchema,
  ColumnQuerySchema,
  BoardIdSchema,
  TaskIdSchema,
  TaskCountSchema,
} from "./_validators.js";
import { publicProcedure, router } from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import { verifyBoardExistenceAndOwnership } from "./_helpers.js";

export const tasksRouter = router({
  getAllFromBoard: publicProcedure
    .input(BoardIdSchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const allTasks = await Task.getAllFromBoard(input);

      return successResponse.standard({ tasks: allTasks });
    }),

  getCount: publicProcedure
    .input(BoardIdSchema.merge(TaskCountSchema))
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const numTasks = await Task.getNumTasks(input);
      return successResponse.standard({ taskCount: numTasks });
    }),

  getByCreated: publicProcedure
    .input(ColumnQuerySchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const tasks = await Task.getTasksByCreated(input);

      return successResponse.standard({ tasks });
    }),

  getByDueDate: publicProcedure
    .input(ColumnQuerySchema)
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const tasks = await Task.getTasksByDueDate(input);

      return successResponse.standard({ tasks });
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

      return successResponse.standard(task);
    }),

  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const task = await Task.create(input);

      return successResponse.standard(task);
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

      return successResponse.standard({ newStatus: result.status });
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

      return successResponse.standard(result);
    }),

  search: publicProcedure
    .input(BoardIdSchema.merge(z.object({ query: z.string() })))
    .query(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      const results = await Task.search(input);

      return successResponse.standard({ tasks: results });
    }),

  updatePositions: publicProcedure
    .input(UpdatePositionsSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyBoardExistenceAndOwnership(ctx, input);

      await Task.updatePositions(input);

      return successResponse.standard({ success: true });
    }),
});
