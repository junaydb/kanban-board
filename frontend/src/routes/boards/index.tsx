import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import AuthModule from "@/components/AuthModule";
import Banner from "@/components/Banners";
import z from "zod";

export const Route = createFileRoute("/boards/")({
  validateSearch: z.object({
    newUser: z.boolean().nullish(),
  }),
  component: Boards,
});

function Boards() {
  const { newUser } = Route.useSearch();
  const { data: session } = authClient.useSession();

  return (
    <div>
      {newUser && <Banner banner="NEW_USER" />}
      {!session && <Banner banner="LOGGED_OUT" />}
      <AuthModule />
    </div>
  );
}
