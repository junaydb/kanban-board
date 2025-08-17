import type { ITask as Task, TaskStatus } from "./types.js";
import type {
  Cursor,
  NoContentResponse,
  TaskArrayResponse,
  TaskCountResponse,
  TaskResponse,
  TaskArrayResponseWithMeta,
  TaskUpdateResponse,
} from "./types.js";

export const successResponse = {
  single: (data: Task): TaskResponse => {
    return { success: true, data: { ...data } };
  },
  array: (data: Task[]): TaskArrayResponse => {
    return { success: true, data: { tasks: data } };
  },
  withMeta: (data: Task[], meta: Cursor): TaskArrayResponseWithMeta => {
    return { success: true, data: { tasks: data }, meta: meta };
  },
  count: (data: number): TaskCountResponse => {
    return { success: true, data: { count: data } };
  },
  newStatus: (data: TaskStatus): TaskUpdateResponse => {
    return { success: true, data: { newStatus: data } };
  },
  empty: (): NoContentResponse => {
    return { success: true };
  },
};

export function errorResponse(message: string, errors?: {} | []) {
  if (!errors) {
    return { success: false, message: message };
  }
  if (Array.isArray(errors)) {
    return { success: false, message: message, errors: errors };
  }
  return { success: false, message: message, errors: { ...errors } };
}
