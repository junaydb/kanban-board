import type { ApiResponse, ApiResponseWithMeta } from "./types.js";

export const successResponse = {
  single: <T extends any>(
    data: T extends any[] ? never : T,
  ): ApiResponse<T> => {
    return { data };
  },

  array: <T extends Record<string, any[]>>(data: T): ApiResponse<T> => {
    // Example: { success: true, data: { tasks: [...] } }
    return { data };
  },

  arrayWithMeta: <T extends Record<string, any[]>, U>(
    data: T,
    meta: U,
  ): ApiResponseWithMeta<T, U> => {
    return { data, meta };
  },
};
