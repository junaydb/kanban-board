import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";

export const Route = createFileRoute("/boards/$user/$board")({
  beforeLoad: async () => {
    const { data: session, error } = await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/boards",
        search: { boardAuthError: true },
      });
    }

    if (error) {
      // TODO: handle auth error
    }
  },

  component: Board,
});

function Board() {
  const { board } = Route.useParams();

  return <div>Hello from Board {board}</div>;
}
