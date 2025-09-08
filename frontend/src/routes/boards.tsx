import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boards")({
  component: Home,
});

function Home() {
  return <div className="p-2">Hello from Boards!</div>;
}
