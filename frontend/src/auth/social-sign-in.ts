import { authClient } from "./auth-client";
import type { AuthProviders } from "@/util/types";

function getUrlPrefix(path = "/") {
  return process.env.NODE_ENV === "prod"
    ? path
    : `http://localhost:5173/${path}`;
}

export async function socialSignIn(provider: AuthProviders) {
  await authClient.signIn.social({
    provider: provider,
    callbackURL: getUrlPrefix(),
    newUserCallbackURL: getUrlPrefix("/boards?newUser=true"),
    errorCallbackURL: getUrlPrefix("/boards?oauthError=true"),
  });
}
