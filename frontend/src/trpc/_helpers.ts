import type { TRPCClientErrorLike } from "@trpc/client";
import type { TRPCDefaultErrorShape } from "@trpc/server";

export const defaultRetry = (
  failureCount: number,
  error: TRPCClientErrorLike<{
    transformer: false;
    errorShape: TRPCDefaultErrorShape;
  }>,
) => {
  // do not retry query if we get an auth error or not found error
  if (
    error?.data?.code === "UNAUTHORIZED" ||
    error?.data?.code === "NOT_FOUND"
  ) {
    return false;
  }
  return failureCount < 3;
};
