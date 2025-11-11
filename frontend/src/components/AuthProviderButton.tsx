import type { AuthProvider } from "@/util/auth-providers";
import { socialSignIn } from "@/auth/social-sign-in";
import { SocialIcons } from "./SocialIcons";
import { toast } from "sonner";
import { Button } from "@/shadcn/ui/button";

type NameMapType = Record<AuthProvider, string>;

const nameMap: NameMapType = {
  google: "Google",
  github: "GitHub",
};

async function handleSignIn(provider: AuthProvider) {
  const res = await socialSignIn(provider);
  if (res.error) {
    toast.error("An error occurred whilst trying to sign in");
  }
}

export function AuthProviderButton({ provider }: { provider: AuthProvider }) {
  // TODO: change "light" to theme when dark mode is implemented
  return (
    <Button key={provider} onClick={() => handleSignIn(provider)}>
      {SocialIcons[provider]["light"]()}
      {nameMap[provider]}
    </Button>
  );
}
