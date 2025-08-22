import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards } from "../db/schema.js";
import {
  AuthSchema,
  BoardIdSchema,
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
  PageQuerySchema,
  TaskIdSchema,
  UpdateBoardNameSchema,
  UpdateStatusSchema,
  VerifyBoardOwnershipSchema,
  VerifyTaskOwnershipSchema,
} from "../routes/validation.schemas.js";

/* Types derived from drizzle schema */
export type TTask = InferSelectModel<typeof tasks>;
export type CreateTaskParams = InferInsertModel<typeof tasks>;
export type TaskStatusEnum = TTask["status"];
export type InsertBoardParams = InferInsertModel<typeof boards>;

/* Types derived fron Zod schemas */
export type UpdateStatusParams = z.infer<typeof UpdateStatusSchema>;
export type UpdateBoardNameParams = z.infer<typeof UpdateBoardNameSchema>;
export type AuthParams = z.infer<typeof AuthSchema>;
export type VerifyBoardOwnershipParams = z.infer<
  typeof VerifyBoardOwnershipSchema
>;
export type VerifyTaskOwnershipParams = z.infer<
  typeof VerifyTaskOwnershipSchema
>;
export type TaskIdParams = z.infer<typeof TaskIdSchema>;
export type BoardIdParams = z.infer<typeof BoardIdSchema>;
// Pagination types
export type ByCreatedCursor = z.infer<typeof ByCreatedCursorSchema>;
export type ByDueDateCursor = z.infer<typeof ByDueDateCursorSchema>;
export type Cursors = ByCreatedCursor | ByDueDateCursor;
export type PageQuery = z.infer<typeof PageQuerySchema>;
export type ByCreatedPageParams = Omit<PageQuery, "cursor"> & {
  cursor?: ByCreatedCursor;
};
export type ByDueDatePageParams = Omit<PageQuery, "cursor"> & {
  cursor?: ByDueDateCursor;
};

/* HTTP response wrapper types */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}
export interface ApiResponseWithMeta<T, U> extends ApiResponse<T> {
  meta: U;
}
