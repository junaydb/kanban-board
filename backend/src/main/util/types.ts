import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards, taskPositions } from "../db/schema.js";
import {
  BoardIdSchema,
  ColumnQuerySchema,
  TaskIdSchema,
  UpdateStatusSchema,
  UpdatePositionsSchema,
  BoardTitleSchema,
  UserIdSchema,
  TaskCountSchema,
} from "../routes/_validators.js";

/* Types derived from drizzle schema */
export type TTask = InferSelectModel<typeof tasks>;
export type CreateTaskParams = InferInsertModel<typeof tasks>;
export type TaskStatusEnum = TTask["status"];
export type InsertBoardParams = InferInsertModel<typeof boards>;
export type TTaskPositions = InferSelectModel<typeof taskPositions>;

/* Types derived from Zod schemas */
export type UpdateStatusParams = z.infer<typeof UpdateStatusSchema>;
export type TaskIdParams = z.infer<typeof TaskIdSchema>;
export type BoardIdParams = z.infer<typeof BoardIdSchema>;
export type UserIdParams = z.infer<typeof UserIdSchema>;
export type TaskCountParams = z.infer<typeof TaskCountSchema>;
export type UpdateBoardNameParams = z.infer<
  typeof BoardIdSchema & typeof BoardTitleSchema
>;
export type VerifyBoardOwnershipParams = z.infer<
  typeof UserIdSchema & typeof BoardIdSchema
>;
export type TaskSearchParams = z.infer<typeof BoardIdSchema> & {
  query: string;
};

export type ColumnQuery = z.infer<typeof ColumnQuerySchema>;
export type ByCreatedColParams = Omit<ColumnQuery, "sortBy">;
export type ByDueDateColParams = Omit<ColumnQuery, "sortBy">;
export type ByPositionColParams = Omit<ColumnQuery, "sortBy" | "sortOrder">;
export type UpdatePositionsParams = z.infer<typeof UpdatePositionsSchema>;

/* HTTP response wrapper types */
export interface ApiResponse<T = any> {
  data: T;
}
export interface ApiResponseWithMeta<T, U> extends ApiResponse<T> {
  meta: U;
}
