import { authClient } from "./auth-client";
import type { AuthProvider } from "@/util/auth-providers";

function getUrlPrefix(path?: string) {
  return process.env.NODE_ENV === "prod"
    ? path
    : `http://localhost:5173/${path ?? ""}`;
}

export async function socialSignIn(provider: AuthProvider) {
  const res = await authClient.signIn.social({
    provider: provider,
    callbackURL: getUrlPrefix(),
    newUserCallbackURL: getUrlPrefix("/boards?redirect=newUser"),
    errorCallbackURL: getUrlPrefix("/boards?redirect=oauthError"),
  });

  return res;
}
