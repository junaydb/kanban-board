import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards/$board")({
  component: Board,
});

function Board() {
  const { board } = Route.useParams();

  return <div>Hello from offline Board {board}</div>;
}
