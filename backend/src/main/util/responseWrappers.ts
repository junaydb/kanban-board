import type { ApiResponse, ApiResponseWithMeta } from "./types.js";

export const successResponseFactory = {
  standard: <T>(data: T): ApiResponse<T> => {
    return { success: true, data };
  },
  withMeta: <T, U>(data: T, meta: U): ApiResponseWithMeta<T, U> => {
    return { success: true, data, meta };
  },
  noData: (): Omit<ApiResponse, "data"> => {
    return { success: true };
  },
};

export function errorResponse<T extends any[]>(message: string, errors?: T) {
  return { success: false, message, errors };
}
