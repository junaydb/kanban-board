import { createFileRoute } from "@tanstack/react-router";
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
  const { data: session } = authClient.useSession();

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grow rounded-md border-2 border-dashed flex items-center justify-center">
        <p className="text-muted-foreground">Open a board using the sidebar</p>
      </div>
      {!session && <Banner banner="LOGGED_OUT" />}
      {newUser && <Banner banner="NEW_USER" />}
      {accountRemoved && <Banner banner="ACCOUNT_REMOVED" />}
    </div>
  );
}
