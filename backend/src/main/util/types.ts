import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards } from "../db/schema.js";
import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
  PaginationQuerySchema,
  UpdateStatusSchema,
  SortOrderSchema,
} from "../routes/tasks.schemas.js";

export type TTask = InferSelectModel<typeof tasks>;
export type CreateTaskParams = InferInsertModel<typeof tasks>;
export type TaskStatusEnum = TTask["status"];
export type UpdateStatusParams = z.infer<typeof UpdateStatusSchema>;
export type InsertBoardParams = InferInsertModel<typeof boards>;

export type ByCreatedCursor = z.infer<typeof ByCreatedCursorSchema>;
export type ByDueDateCursor = z.infer<typeof ByDueDateCursorSchema>;
export type Cursors = ByCreatedCursor | ByDueDateCursor;

type PaginationParamsRaw = z.infer<typeof PaginationQuerySchema>;
export type ByCreatedPaginationParams = Omit<
  PaginationParamsRaw,
  "cursor" | "sortBy"
> & {
  cursor: ByCreatedCursor;
};
export type ByDueDatePaginationParams = Omit<
  PaginationParamsRaw,
  "cursor" | "sortBy"
> & {
  cursor: ByDueDateCursor;
};

export type SortOrder = z.infer<typeof SortOrderSchema>;

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
