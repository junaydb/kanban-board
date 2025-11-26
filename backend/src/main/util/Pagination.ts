import {
  ByCreatedCursorSchema,
  ByDueDateCursorSchema,
} from "../routes/_validators.js";
import type {
  TTask,
  PageQuery,
  ByCreatedPageParams,
  ByDueDatePageParams,
} from "./types.js";
import type { Cursors } from "./types.js";

// Could opt for strategy pattern in the future if more sort strategies are added,
// but this works for now.
class Pagination {
  static encodeCursor(cursor: Cursors) {
    return Buffer.from(JSON.stringify(cursor)).toString("base64");
  }

  static decodeCursor(cursor: string) {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
  }

  static getNextByCreatedCursor(lastTask: TTask) {
    return Pagination.encodeCursor({
      prevId: lastTask.id,
      prevCreatedAt: lastTask.createdAt,
    });
  }

  static getNextByDueDateCursor(lastTask: TTask) {
    return Pagination.encodeCursor({
      prevId: lastTask.id,
      prevDueDate: lastTask.dueDate,
    });
  }

  static generateByCreatedParams(params: PageQuery) {
    const { cursor: encodedCursor, ...paramsWithoutEncodedCursor } = params;

    let generated: ByCreatedPageParams;
    if (encodedCursor) {
      const decodedCursor = Pagination.decodeCursor(encodedCursor);
      const validatedCursor = ByCreatedCursorSchema.parse(decodedCursor);
      generated = { ...paramsWithoutEncodedCursor, cursor: validatedCursor };
    } else {
      generated = { ...paramsWithoutEncodedCursor };
    }

    return generated;
  }

  static generateByDueDateParams(params: PageQuery) {
    const { cursor: encodedCursor, ...paramsWithoutEncodedCursor } = params;

    let generated: ByDueDatePageParams;
    if (encodedCursor) {
      const decodedCursor = Pagination.decodeCursor(encodedCursor);
      const validatedCursor = ByDueDateCursorSchema.parse(decodedCursor);
      generated = { ...paramsWithoutEncodedCursor, cursor: validatedCursor };
    } else {
      generated = { ...paramsWithoutEncodedCursor };
    }

    return generated;
  }
}

export default Pagination;
