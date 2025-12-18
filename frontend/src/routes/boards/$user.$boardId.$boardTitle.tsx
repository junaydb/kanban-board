import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import { toast } from "sonner";
import { Board } from "@/components/kanban-board/Board";

export const Route = createFileRoute("/boards/$user/$boardId/$boardTitle")({
  beforeLoad: async () => {
    const { data: session, error: betterAuthError } =
      await authClient.getSession();

    if (!session || betterAuthError) {
      toast.error("Authorsation error");

      throw redirect({
        to: "/boards",
        search: { redirect: "boardAuthError" },
      });
    }
  },

  component: BoardRoot,
});

function BoardRoot() {
  const { boardId } = Route.useParams();

  return <Board boardId={parseInt(boardId)} />;
}
