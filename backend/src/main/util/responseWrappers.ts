import type { ApiResponse, ApiResponseWithMeta } from "./types.js";

export const successResponse = {
  standard: <T extends Record<string, any>>(data: T): ApiResponse<T> => {
    // Example: { data: { tasks: [...] } } or { data: { user: {...} } }
    return { data };
  },

  withMeta: <T extends Record<string, any>, U>(
    data: T,
    meta: U,
  ): ApiResponseWithMeta<T, U> => {
    return { data, meta };
  },
};
