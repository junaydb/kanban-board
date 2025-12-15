import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
} from "../routes/_validators.js";
import type {
  TTask,
  PageQuery,
  ByCreatedCursor,
  ByDueDateCursor,
  ByCreatedPageParams,
  ByDueDatePageParams,
  ByPositionPageParams,
} from "./types.js";

function encodeCursor(cursor: ByCreatedCursor | ByDueDateCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, "base64").toString());
}

export const Pagination = {
  created: {
    getNextCursor(lastTask: TTask) {
      const cursorData: ByCreatedCursor = {
        prevId: lastTask.id,
        prevCreatedAt: lastTask.createdAt,
      };
      return encodeCursor(cursorData);
    },
    generateParams(params: PageQuery): ByCreatedPageParams {
      const { cursor: encodedCursor, ...paramsWithoutCursor } = params;

      if (encodedCursor) {
        const decodedCursor = decodeCursor(encodedCursor);
        const validatedCursor = ByCreatedCursorSchema.parse(decodedCursor);
        return { ...paramsWithoutCursor, cursor: validatedCursor };
      }

      return paramsWithoutCursor;
    },
  },
  dueDate: {
    getNextCursor(lastTask: TTask) {
      const cursorData: ByDueDateCursor = {
        prevId: lastTask.id,
        prevDueDate: lastTask.dueDate,
      };
      return encodeCursor(cursorData);
    },
    generateParams(params: PageQuery): ByDueDatePageParams {
      const { cursor: encodedCursor, ...paramsWithoutCursor } = params;

      if (encodedCursor) {
        const decodedCursor = decodeCursor(encodedCursor);
        const validatedCursor = ByDueDateCursorSchema.parse(decodedCursor);
        return { ...paramsWithoutCursor, cursor: validatedCursor };
      }

      return paramsWithoutCursor;
    },
  },
  position: {
    getNextCursor(pageSize: number, cursor?: string) {
      const currIndex = cursor ? parseInt(cursor) : 0;
      return String(currIndex + pageSize);
    },
    generateParams(params: PageQuery): ByPositionPageParams {
      const { cursor, ...paramsWithoutCursor } = params;
      const currIndex = cursor ? parseInt(cursor) : 0;
      return { cursor: currIndex, ...paramsWithoutCursor };
    },
  },
};
