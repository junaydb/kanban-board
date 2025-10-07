import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/boards/_/$boardId")({
  validateSearch: z.object({
    boardId: z.number(),
  }),
  component: BoardId,
});

function BoardId() {
  const { boardId } = Route.useParams();
  return <div>Hello from Board {boardId}</div>;
}
