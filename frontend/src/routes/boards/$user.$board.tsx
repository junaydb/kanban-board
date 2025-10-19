import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards/$user/$board")({
  component: Board,
});

function Board() {
  const { board } = Route.useParams();

  return <div>Hello from Board {board}</div>;
}
