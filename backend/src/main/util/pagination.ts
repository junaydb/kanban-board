import Task from "../models/Task.js";
import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
} from "../routes/tasks.schemas.js";
import type { TTask } from "./types.js";
import type { ByCreatedCursor, ByDueDateCursor, Cursors } from "./types.js";

export function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, "base64").toString());
}

export function encodeCursor(cursor: Cursors) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export const strategies = {
  created: {
    getTasks: Task.getTasksByCreated,
    cursorSchema: ByCreatedCursorSchema,
    getNextCursor: (lastTask: TTask): ByCreatedCursor => ({
      prevId: lastTask.id,
      prevCreatedAt: lastTask.createdAt,
    }),
  },
  dueDate: {
    getTasks: Task.getTasksByDueDate,
    cursorSchema: ByDueDateCursorSchema,
    getNextCursor: (lastTask: TTask): ByDueDateCursor => ({
      prevId: lastTask.id,
      prevDueDate: lastTask.dueDate,
    }),
  },
};
