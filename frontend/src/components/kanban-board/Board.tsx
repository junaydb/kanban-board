import { Column } from "./Column";
import { BoardTitle, BoardTitleSkeleton } from "./BoardTitle";
import { BoardToolbar, BoardToolbarSkeleton } from "./BoardToolbar";
import { useBoardLookup } from "@/trpc/board-hooks";
import { toast } from "sonner";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useState, useEffect } from "react";
import {
  useGetAllTasks,
  useUpdateTaskStatus,
  useUpdateTaskPositions,
} from "@/trpc/task-hooks";
import type {
  TaskStatusEnum,
  SortParams,
  TTask,
  BoardIdParams,
} from "@backend/util/types";
import { Task } from "./Task";

type TasksByStatus = Record<TaskStatusEnum, TTask[]>;

export function Board({ boardId }: BoardIdParams) {
  const [tasks, setTasks] = useState<TasksByStatus>({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });

  const [originalContainer, setOriginalContainer] =
    useState<TaskStatusEnum | null>(null);

  const [sortBy, setSortBy] = useState<SortParams["sortBy"]>(() => {
    const stored = localStorage.getItem("boardSortBy");
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, SortParams["sortBy"]>;
      return parsed[boardId] ?? "position";
    }
    return "position";
  });

  const [sortOrder, setSortOrder] = useState<SortParams["sortOrder"]>("DESC");

  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { mutate: updateTaskPos } = useUpdateTaskPositions();

  const {
    data: fetchedTasks,
    isPending: isPending_tasks,
    isError: isError_tasks,
  } = useGetAllTasks({ boardId, sortBy, sortOrder });

  const {
    data: boardData,
    isPending: isPending_boardLookUp,
    error,
  } = useBoardLookup({ boardId });

  function findTaskContainer(
    taskId: number,
    tasksMap: TasksByStatus = tasks,
  ): TaskStatusEnum | null {
    if (tasksMap.TODO.some((t) => t.id === taskId)) return "TODO";
    if (tasksMap.IN_PROGRESS.some((t) => t.id === taskId)) return "IN_PROGRESS";
    if (tasksMap.DONE.some((t) => t.id === taskId)) return "DONE";
    return null;
  }

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  useEffect(() => {
    const stored = localStorage.getItem("boardSortBy");
    const parsed: Record<string, SortParams["sortBy"]> = stored
      ? JSON.parse(stored)
      : {};
    parsed[boardId] = sortBy;
    localStorage.setItem("boardSortBy", JSON.stringify(parsed));
  }, [sortBy, boardId]);

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      toast.error("You do not own the requested resource");
    } else if (error) {
      toast.error(
        "An error occurred whilst opening this board, please refresh the page.",
      );
    }
  }, [error]);

  useEffect(() => {
    if (isError_tasks) {
      toast.error("Failed to fetch tasks");
    }
  }, [isError_tasks]);

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
  }

  return (
    <div className="h-full flex flex-col">
      {isPending_boardLookUp ? (
        <BoardTitleSkeleton />
      ) : (
        <BoardTitle boardId={boardId} title={boardData!.data.title} />
      )}
      {isPending_boardLookUp ? (
        <BoardToolbarSkeleton />
      ) : (
        <BoardToolbar setSortBy={setSortBy} setSortOrder={setSortOrder} />
      )}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 ml-3 mr-2 mb-2 mt-3">
        <DragDropProvider
          onDragStart={(event) => {
            const { source } = event.operation;
            if (!source) return;
            setOriginalContainer(findTaskContainer(source.id as number));
          }}
          onDragOver={(event) => {
            setTasks((prev) => move(prev, event));
          }}
          onDragEnd={(event) => {
            const { source } = event.operation;

            if (event.canceled || !source) {
              setOriginalContainer(null);
              return;
            }

            const updatedTasks = move(tasks, event);
            setTasks(updatedTasks);

            const positionData = {
              boardId,
              todoPos: updatedTasks.TODO.map((t) => t.id),
              inProgressPos: updatedTasks.IN_PROGRESS.map((t) => t.id),
              donePos: updatedTasks.DONE.map((t) => t.id),
            };

            updateTaskPos(positionData, {
              onSuccess: () => {
                setSortBy("position");
              },
              onError: () => {
                toast.error("Failed to save task positions");
              },
            });

            const newContainer = findTaskContainer(
              source.id as number,
              updatedTasks,
            );
            if (
              originalContainer &&
              newContainer &&
              originalContainer !== newContainer
            ) {
              updateTaskStatus(
                {
                  taskId: source.id as number,
                  boardId: boardId,
                  newStatus: newContainer,
                },
                {
                  onSuccess: () => {
                    toast.success("Status updated");
                  },
                  onError: () => {
                    toast.error("Failed to update status");
                  },
                },
              );
            }

            setOriginalContainer(null);
          }}
        >
          <Column
            tasks={tasks.TODO}
            status="TODO"
            isPending={isPending_tasks && tasks.TODO.length === 0}
          />
          <Column
            tasks={tasks.IN_PROGRESS}
            status="IN_PROGRESS"
            isPending={isPending_tasks && tasks.IN_PROGRESS.length === 0}
          />
          <Column
            tasks={tasks.DONE}
            status="DONE"
            isPending={isPending_tasks && tasks.DONE.length === 0}
          />
          <DragOverlay dropAnimation={{ duration: 100 }}>
            {(source) => (
              <Task task={(source.data as { task: TTask }).task} isOverlay />
            )}
          </DragOverlay>
        </DragDropProvider>
      </div>
    </div>
  );
}
