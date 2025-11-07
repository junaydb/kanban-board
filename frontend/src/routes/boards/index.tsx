import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import z from "zod";
import { Banner } from "@/components/Banners";
import { toast } from "sonner";
import { useEffect } from "react";
import { useClientNetworkStatus } from "@/context/ClientNetworkStatusContext";
import { useServerNetworkStatus } from "@/context/ServerNetworkStatusContext";

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
      .optional()
      .catch(undefined),
  }),
  component: Boards,
});

function Boards() {
  const search = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();
  const clientOnline = useClientNetworkStatus();
  const serverOnline = useServerNetworkStatus();

  useEffect(() => {
    switch (search.redirect) {
      case "accountRemoved":
        toast.success("Account deletion succesful");
        break;
      case "logoutSuccess":
        toast.success("Logout successful");
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
      {!clientOnline && <Banner banner="CLIENT_OFFLINE" />}
      {!serverOnline && <Banner banner="SERVER_OFFLINE" />}
    </div>
  );
}
