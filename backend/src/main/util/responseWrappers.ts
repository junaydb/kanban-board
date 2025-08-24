import type { ApiResponse, ApiResponseWithMeta } from "./types.js";

export const successResponseFactory = {
  single: <T extends any>(
    data: T extends any[] ? never : T,
  ): ApiResponse<T> => {
    return { success: true, data };
  },
  array: <T extends Record<string, any[]>>(data: T): ApiResponse<T> => {
    // Example: { success: true, data: { tasks: [...] } }
    return { success: true, data };
  },
  arrayWithMeta: <T extends Record<string, any[]>, U>(
    data: T,
    meta: U,
  ): ApiResponseWithMeta<T, U> => {
    return { success: true, data, meta };
  },
  noData: (): Omit<ApiResponse, "data"> => {
    return { success: true };
  },
};

export function errorResponse<T extends any[]>(message: string, errors?: T) {
  return { success: false, message, errors };
}
