import { authClient } from "./auth-client";
import type { AuthProviders } from "@/util/types";

export async function socialSignIn(provider: AuthProviders) {
  await authClient.signIn.social({
    /**
     * The social provider ID
     * @example "github", "google", "apple"
     */
    provider: provider,
  });
}
