import { Column } from "./Column";
import { BoardTitle } from "./BoardTitle";
import { useBoardLookup } from "@/trpc/board-hooks";
import { toast } from "sonner";

type BoardProps = {
  boardId: number;
};

const PAGE_SIZE = 10;

export function Board({ boardId }: BoardProps) {
  const { data, isSuccess, isPending, error } = useBoardLookup({ boardId });

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
  } else if (error) {
    toast.error(
      "An error occurred whilst opening this board, please refresh the page.",
    );
  }

  if (isPending) {
    // TODO: render skeleton loading ui
  }

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col p-2">
        <BoardTitle boardId={boardId} title={data.data.title} />
        <div className="flex gap-4 grow">
          <Column boardId={boardId} status="TODO" pageSize={PAGE_SIZE} />
          <Column boardId={boardId} status="IN_PROGRESS" pageSize={PAGE_SIZE} />
          <Column boardId={boardId} status="DONE" pageSize={PAGE_SIZE} />
        </div>
      </div>
    );
  }
}
