import { socialSignIn } from "@/auth/social-sign-in";
import type { AuthProviders } from "@/util/types";
import type { ComponentType } from "react";
import type { SvgIconProps } from "../SVGIcons";
import { Github, Google } from "../SVGIcons";
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/shadcn/ui/sidebar";
import { Button } from "@/shadcn/ui/button";

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

function SidebarSignIn() {
  return (
    <Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-gray-200/80 hover:bg-gray-200 active:bg-gray-200 data-[state=open]:bg-gray-200 cursor-pointer text-sidebar-accent-foreground justify-center"
            >
              Sign in
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Enables storing and accessing boards remotely
              </DialogDescription>
            </DialogHeader>
            {providers.map((elem) => {
              const { provider, icon: Icon, text, handler } = elem;
              return (
                <Button key={provider} onClick={handler}>
                  <Icon fill="white" />
                  {text}
                </Button>
              );
            })}
          </DialogContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Dialog>
  );
}

export default SidebarSignIn;
