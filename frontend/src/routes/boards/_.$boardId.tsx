import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards/_/$boardId")({
  component: BoardId,
});

function BoardId() {
  const { boardId } = Route.useParams();

  return <div>Hello from Board {boardId}</div>;
}
