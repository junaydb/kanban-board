import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import z from "zod";
import Banner from "@/components/Banners";

export const Route = createFileRoute("/boards/")({
  validateSearch: z.object({
    newUser: z.boolean().nullish(),
    accountRemoved: z.boolean().nullish(),
  }),
  component: Boards,
});

function Boards() {
  const { newUser, accountRemoved } = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  // TODO: Success toast for when user logs out

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grow rounded-md border-2 border-dashed flex items-center justify-center">
        <p className="text-muted-foreground">Open a board using the sidebar</p>
        <Outlet />
      </div>
      {!session && <Banner banner="LOGGED_OUT" />}
      {newUser && <Banner banner="NEW_USER" />}
      {accountRemoved && <Banner banner="ACCOUNT_REMOVED" />}
    </div>
  );
}
