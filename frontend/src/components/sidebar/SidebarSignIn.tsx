import { socialSignIn } from "@/auth/social-sign-in";
import type { AuthProviders } from "@/util/types";
import { useEffect, type ComponentType } from "react";
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
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shadcn/ui/sidebar";
import { Button } from "@/shadcn/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shadcn/ui/tooltip";
import { useHealthCheck } from "@/util/helpers";
import { toast } from "sonner";
import { SpinnerBar } from "../SpinnerBar";

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

export function SidebarSignIn() {
  const { isLoading, isError } = useHealthCheck();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to connect to server");
    }
  }, [isError]);

  if (isLoading) {
    return <SpinnerBar />;
  }

  const signInButton = (
    <SidebarMenuButton
      size="lg"
      className="bg-gray-200/80 hover:bg-gray-200 active:bg-gray-200 data-[state=open]:bg-gray-200 cursor-pointer text-sidebar-accent-foreground justify-center"
      disabled={!isError}
    >
      Sign in
    </SidebarMenuButton>
  );

  return (
    <Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          {isError ? (
            <DialogTrigger asChild>{signInButton}</DialogTrigger>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block w-full cursor-pointer">
                  {signInButton}
                </span>
              </TooltipTrigger>
              <TooltipContent
                className="bg-red-500"
                arrowClassName="bg-red-500 fill-red-500"
              >
                <p>Server unreachable</p>
              </TooltipContent>
            </Tooltip>
          )}
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
