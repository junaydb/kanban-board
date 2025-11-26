import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards/$boardTitle")({
  component: Board,
});

function Board() {
  const { boardTitle } = Route.useParams();

  return <div>Hello from offline Board {boardTitle}</div>;
}
