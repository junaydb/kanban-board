import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards } from "../db/schema.js";
import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
  PageQuerySchema,
  UpdateStatusSchema,
} from "../routes/validation.schemas.js";

export type TTask = InferSelectModel<typeof tasks>;
export type CreateTaskParams = InferInsertModel<typeof tasks>;
export type TaskStatusEnum = TTask["status"];
export type UpdateStatusParams = z.infer<typeof UpdateStatusSchema>;
export type InsertBoardParams = InferInsertModel<typeof boards>;

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

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export interface ApiResponseWithMeta<T = any> extends ApiResponse<T> {
  meta: Cursor;
}

export interface TaskResponse extends ApiResponse<TTask> {}

export interface TaskArrayResponse extends ApiResponse<{ tasks: TTask[] }> {}

export interface TaskArrayResponseWithMeta
  extends ApiResponseWithMeta<{ tasks: TTask[] }> {}

export interface TaskUpdateResponse
  extends ApiResponse<{ newStatus: TaskStatusEnum }> {}

export interface NoContentResponse extends Omit<ApiResponse, "data"> {}

export interface TaskCountResponse extends ApiResponse<{ count: number }> {}

export type Cursor = { cursor: string | null };
