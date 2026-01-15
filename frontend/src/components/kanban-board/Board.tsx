import { Column } from "./Column";
import { BoardTitle, BoardTitleSkeleton } from "./BoardTitle";
import { BoardToolbar, BoardToolbarSkeleton } from "./BoardToolbar";
import { useBoardLookup } from "@/trpc/board-hooks";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import {
  useGetTaskPage,
  useUpdateTaskStatus,
  useUpdateTaskPositions,
} from "@/trpc/task-hooks";
import type {
  TaskStatusEnum,
  PageQuery,
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

  const [activeTask, setActiveTask] = useState<TTask | null>(null);
  const [originalContainer, setOriginalContainer] =
    useState<TaskStatusEnum | null>(null);

  const [sortBy, setSortBy] = useState<PageQuery["sortBy"]>(() => {
    const stored = localStorage.getItem("boardSortBy");
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, PageQuery["sortBy"]>;
      return parsed[boardId] ?? "dueDate";
    }
    return "dueDate";
  });

  useEffect(() => {
    const stored = localStorage.getItem("boardSortBy");
    const parsed: Record<string, PageQuery["sortBy"]> = stored
      ? JSON.parse(stored)
      : {};
    parsed[boardId] = sortBy;
    localStorage.setItem("boardSortBy", JSON.stringify(parsed));
  }, [sortBy, boardId]);

  const [sortOrder, setSortOrder] = useState<PageQuery["sortOrder"]>("DESC");
  const [pageSize, setPageSize] = useState(10);

  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { mutate: updateTaskPos } = useUpdateTaskPositions();

  const {
    tasks: tasks_todos,
    isLoading: isLoading_todos,
    isPending: isPending_todos,
    hasNextPage: hasNextPage_todos,
    fetchNextPage: fetchNextPage_todos,
    isFetchingNextPage: isFetchingNextPage_todos,
    isError: isError_todos,
  } = useGetTaskPage({
    boardId,
    status: "TODO",
    sortBy,
    sortOrder,
    pageSize,
  });

  const {
    tasks: tasks_inProgress,
    isLoading: isLoading_inProgress,
    isPending: isPending_inProgress,
    hasNextPage: hasNextPage_inProgress,
    fetchNextPage: fetchNextPage_inProgress,
    isFetchingNextPage: isFetchingNextPage_inProgress,
    isError: isError_inProgress,
  } = useGetTaskPage({
    boardId,
    status: "IN_PROGRESS",
    sortBy,
    sortOrder,
    pageSize,
  });

  const {
    tasks: tasks_done,
    isLoading: isLoading_done,
    isPending: isPending_done,
    hasNextPage: hasNextPage_done,
    fetchNextPage: fetchNextPage_done,
    isFetchingNextPage: isFetchingNextPage_done,
    isError: isError_done,
  } = useGetTaskPage({
    boardId,
    status: "DONE",
    sortBy,
    sortOrder,
    pageSize,
  });

  const {
    data: boardData,
    isPending: isPending_boardLookUp,
    error,
  } = useBoardLookup({ boardId });

  useEffect(() => {
    if (tasks_todos) {
      setTasks((prev) => ({ ...prev, TODO: tasks_todos }));
    }
  }, [tasks_todos]);

  useEffect(() => {
    if (tasks_inProgress) {
      setTasks((prev) => ({ ...prev, IN_PROGRESS: tasks_inProgress }));
    }
  }, [tasks_inProgress]);

  useEffect(() => {
    if (tasks_done) {
      setTasks((prev) => ({ ...prev, DONE: tasks_done }));
    }
  }, [tasks_done]);

  // Find which container a task or container ID belongs to
  function findContainer(id: UniqueIdentifier): TaskStatusEnum | null {
    // Check if id is a container ID
    if (id in tasks) {
      return id as TaskStatusEnum;
    }

    // Otherwise check if it's a task ID
    if (tasks.TODO.some((t) => t.id === id)) return "TODO";
    if (tasks.IN_PROGRESS.some((t) => t.id === id)) return "IN_PROGRESS";
    if (tasks.DONE.some((t) => t.id === id)) return "DONE";

    return null;
  }

  // for knowing when to show drag overlay
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const taskId = active.id as number;

    const task =
      tasks.TODO.find((t) => t.id === taskId) ||
      tasks.IN_PROGRESS.find((t) => t.id === taskId) ||
      tasks.DONE.find((t) => t.id === taskId);

    setActiveTask(task ?? null);
    setOriginalContainer(findContainer(taskId));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const { id: activeId } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    // we're not over a valid container or we're over the same container so no
    // special handling for moving to another container is required
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setTasks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // find the indexes of the active task and the task being hovered over
      const activeIndex = activeItems.findIndex((task) => task.id === activeId);
      const overIndex = overItems.findIndex((task) => task.id === overId);

      // Get the task being moved
      const movedTask = activeItems[activeIndex];
      if (!movedTask) return prev;

      let newIndex;
      if (overIndex in prev) {
        // we're hovering over the container itself, not a task, so insert at the end
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          overIndex === overItems.length - 1 &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const positionShift = isBelowLastItem ? 1 : 0;
        newIndex = overIndex + positionShift;
      }

      // Create new arrays with the task moved
      return {
        ...prev,
        [activeContainer]: activeItems.filter((task) => task.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          movedTask,
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      setOriginalContainer(null);
      return;
    }

    const { id: activeId } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveTask(null);
      setOriginalContainer(null);
      return;
    }

    let updatedTasks = tasks;

    // Handle reordering within the same column
    if (activeContainer === overContainer) {
      const activeIndex = tasks[activeContainer].findIndex(
        (task) => task.id === activeId,
      );
      const overIndex = tasks[overContainer].findIndex(
        (task) => task.id === overId,
      );

      if (activeIndex !== overIndex && overIndex !== -1) {
        updatedTasks = {
          ...tasks,
          [activeContainer]: arrayMove(
            tasks[activeContainer],
            activeIndex,
            overIndex,
          ),
        };
        setTasks(updatedTasks);
      }
    } else {
      // Task was moved to a different column - tasks state already updated by handleDragOver
      updatedTasks = tasks;
    }

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

    if (originalContainer && originalContainer !== overContainer) {
      updateTaskStatus(
        {
          taskId: activeId as number,
          boardId: boardId,
          newStatus: overContainer,
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

    setActiveTask(null);
    setOriginalContainer(null);
  }

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

  if (isError_todos || isError_inProgress || isError_done) {
    toast.error("Failed to fetch tasks");
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
        <BoardToolbar
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      )}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 ml-3 mr-2 mb-2 mt-3">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          // collisionDetection={closestCorners}
        >
          <SortableContext
            items={tasks.TODO.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Column
              tasks={tasks.TODO}
              status="TODO"
              isPending={isPending_todos}
            />
          </SortableContext>
          <SortableContext
            items={tasks.IN_PROGRESS.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Column
              tasks={tasks.IN_PROGRESS}
              status="IN_PROGRESS"
              isPending={isPending_inProgress}
            />
          </SortableContext>
          <SortableContext
            items={tasks.DONE.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Column
              tasks={tasks.DONE}
              status="DONE"
              isPending={isPending_done}
            />
          </SortableContext>
          <DragOverlay
            dropAnimation={{
              duration: 100,
            }}
          >
            {activeTask ? <Task task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
