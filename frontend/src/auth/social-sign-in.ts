import { authClient } from "./auth-client";
import type { AuthProviders } from "@/util/types";

export async function socialSignIn(provider: AuthProviders) {
  await authClient.signIn.social({
    provider: provider,
    callbackURL:
      process.env.NODE_ENV === "prod" ? "/" : "http://localhost:5173",
    newUserCallbackURL:
      process.env.NODE_ENV === "prod"
        ? "/boards?newUser=true"
        : "http://localhost:5173/boards?newUser=true",
  });
}
