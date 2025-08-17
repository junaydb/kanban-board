import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks } from "../db/schema.js";
import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
  SortOrderSchema,
} from "../routes/tasks.schemas.js";

export type ITask = InferSelectModel<typeof tasks>;
export type ICreateTask = InferInsertModel<typeof tasks>;
export type TaskStatus = ITask["status"];

export type ByCreatedCursor = z.infer<typeof ByCreatedCursorSchema>;
export type ByDueDateCursor = z.infer<typeof ByDueDateCursorSchema>;
export type Cursors = ByCreatedCursor | ByDueDateCursor;

export type SortOrder = z.infer<typeof SortOrderSchema>;

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export interface ApiResponseWithMeta<T = any> extends ApiResponse<T> {
  meta: Cursor;
}

export interface TaskResponse extends ApiResponse<ITask> {}

export interface TaskArrayResponse extends ApiResponse<{ tasks: ITask[] }> {}

export interface TaskArrayResponseWithMeta
  extends ApiResponseWithMeta<{ tasks: ITask[] }> {}

export interface TaskUpdateResponse
  extends ApiResponse<{ newStatus: TaskStatus }> {}

export interface NoContentResponse extends Omit<ApiResponse, "data"> {}

export interface TaskCountResponse extends ApiResponse<{ count: number }> {}

export type Cursor = { cursor: string | null };
