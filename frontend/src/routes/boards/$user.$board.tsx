import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/boards/$user/$board")({
  beforeLoad: async () => {
    const { data: session, error: betterAuthError } =
      await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/boards",
        search: { redirect: "boardAuthError" },
      });
    }

    if (betterAuthError) {
      toast.error("Network error");
    }

    // TODO: check if this board exists
  },

  component: Board,
});

function Board() {
  const { board } = Route.useParams();

  return <div>Hello from Board {board}</div>;
}
