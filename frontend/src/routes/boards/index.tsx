import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import z from "zod";
import Banner from "@/components/Banners";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/boards/")({
  validateSearch: z.object({
    redirect: z
      .enum([
        "newUser",
        "logoutSuccess",
        "accountRemoved",
        "boardAuthError",
        "oauthError",
      ])
      .optional(),
  }),
  component: Boards,
});

function Boards() {
  const search = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    switch (search.redirect) {
      case "accountRemoved":
        toast.success("Your account was successfully deleted");
        break;
      case "logoutSuccess":
        toast.success("You were logged out successfully");
        break;
      case "boardAuthError":
        toast.error("Authorisation error");
        break;
      case "oauthError":
        toast.error("Authentication error");
        break;
    }
  }, [search]);

  if (isPending) {
    // TODO: skeleton loading ui
    return null;
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grow rounded-md border-2 border-dashed flex items-center justify-center">
        <p className="text-muted-foreground">Open a board using the sidebar</p>
        <Outlet />
      </div>
      {!session && <Banner banner="LOGGED_OUT" />}
      {search.redirect === "newUser" && <Banner banner="NEW_USER" />}
    </div>
  );
}
