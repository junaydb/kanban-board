import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards, taskPositions } from "../db/schema.js";
import {
  BoardIdSchema,
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
  PageQuerySchema,
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
// Pagination types
export type ByCreatedCursor = z.infer<typeof ByCreatedCursorSchema>;
export type ByDueDateCursor = z.infer<typeof ByDueDateCursorSchema>;
export type Cursors = ByCreatedCursor | ByDueDateCursor;
export type PageQuery = z.infer<typeof PageQuerySchema>;
export type ByCreatedPageParams = Omit<PageQuery, "cursor" | "sortBy"> & {
  cursor?: ByCreatedCursor;
};
export type ByDueDatePageParams = Omit<PageQuery, "cursor" | "sortBy"> & {
  cursor?: ByDueDateCursor;
};
export type ByPositionPageParams = Omit<
  PageQuery,
  "cursor" | "sortBy" | "sortOrder"
> & {
  cursor?: number; // cursor is the start index in the position array
};
export type UpdatePositionsParams = z.infer<typeof UpdatePositionsSchema>;

/* HTTP response wrapper types */
export interface ApiResponse<T = any> {
  data: T;
}
export interface ApiResponseWithMeta<T, U> extends ApiResponse<T> {
  meta: U;
}
