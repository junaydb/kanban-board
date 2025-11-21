import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { authClient } from "@/auth/auth-client";
import { toast } from "sonner";
import { useBoardLookup } from "@/trpc/board-hooks";
import { useGetAllTasks } from "@/trpc/task-hooks";

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

  component: Board,
});

function Board() {
  const { boardId, boardTitle } = Route.useParams();
  const { error } = useBoardLookup({ boardId: parseInt(boardId) });
  const {
    data: tasks,
    isSuccess,
    isPending,
  } = useGetAllTasks({
    boardId: parseInt(boardId),
  });

  if (error?.data?.code === "NOT_FOUND") {
    return (
      <div className="h-full flex flex-col gap-2">
        <div className="grow rounded-md border-2 border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">
            The board you are trying to open does not exist
          </p>
        </div>
      </div>
    );
  } else if (error?.data?.code === "UNAUTHORIZED") {
    toast.error("You do not own the requested resource");
  }

  if (isPending) {
    // TODO: show skeleton loading ui
  }

  if (isSuccess) {
    console.log(tasks);
  }

  return <div>Hello from Board {boardTitle}</div>;
}
