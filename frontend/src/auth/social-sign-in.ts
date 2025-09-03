import { authClient } from "@/lib/auth-client";

type Providers = "google" | "github";

export async function socialSignIn(provider: Providers) {
  await authClient.signIn.social({
    /**
     * The social provider ID
     * @example "github", "google", "apple"
     */
    provider: provider,
    /**
     * A URL to redirect after the user authenticates with the provider
     * @default "/"
     */
    callbackURL: "/",
    /**
     * disable the automatic redirect to the provider.
     * @default false
     */
    disableRedirect: true,
  });
}
