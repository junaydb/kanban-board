import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards_/$boardId")({
  // validateSearch: (params) => {
  // TODO: validate that boardId is a number
  // },
  //
  component: BoardId,
});

function BoardId() {
  const { boardId } = Route.useParams();
  return <div className="p-2">Hello from Board {boardId}</div>;
}
