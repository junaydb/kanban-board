import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "prod"
      ? process.env.BASE_URL
      : "http://localhost:5173",
});
