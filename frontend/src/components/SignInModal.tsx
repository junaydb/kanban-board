import { socialSignIn } from "@/auth/social-sign-in";
import type { AuthProviders } from "@/util/types";
import type { ComponentType } from "react";
import type { SvgIconProps } from "./util/SVGIcons";
import { Github, Google } from "./util/SVGIcons";
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

type ProviderButtonProps = {
  provider: AuthProviders;
  icon: ComponentType<SvgIconProps>;
  text: string;
  handler: () => Promise<void>;
};

const providers: ProviderButtonProps[] = [
  {
    provider: "google",
    icon: Google,
    text: "Sign in with Google",
    handler: async () => {
      await socialSignIn("google");
    },
  },
  {
    provider: "github",
    icon: Github,
    text: "Sign in with GitHub",
    handler: async () => {
      await socialSignIn("github");
    },
  },
];

function SignInModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sign in</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Sign in to access your boards from anywhere.
          </DialogDescription>
        </DialogHeader>
        {providers.map((elem) => {
          const { provider, icon: Icon, text, handler } = elem;
          return (
            <Button key={provider} className="flex" onClick={handler}>
              <Icon fill="white" />
              {text}
            </Button>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}

export default SignInModal;
