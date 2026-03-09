import { Plus } from "lucide-react";
import { Droppable } from "./Droppable";
import { SortableTask } from "./SortableTask";
import { CreateTaskFormDialog } from "../form/CreateTaskFormDialog";
import { Spinner } from "@/shadcn/ui/spinner";
import { ErrorTooltip } from "@/components/ErrorTooltip";
import { getStatusProps } from "@/util/helpers";
import { useGetNumTasks } from "@/trpc/task-hooks";
import type { TaskStatusEnum, TTask } from "@backend/util/types";

type Props = {
  tasks: TTask[];
  status: TaskStatusEnum;
  boardId: number;
  isPending?: boolean;
};

export function Column({ tasks, status, boardId, isPending }: Props) {
  const statusProps = getStatusProps(status);
  const { data: taskCountData } = useGetNumTasks({ boardId });

  const taskLimitReached = !!(
    taskCountData && taskCountData.taskCount >= taskCountData.taskCountLimit
  );

  const addTaskButton = (
    <button
      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
      aria-label="Add task"
      disabled={taskLimitReached}
    >
      <Plus size={16} />
    </button>
  );

  return (
    <div className="h-fit">
      <div className="flex items-center justify-between p-1">
        <h2 className="font-medium text-lg">{statusProps.text}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{tasks.length}</span>
          {taskLimitReached ? (
            <ErrorTooltip text="Maximum task limit reached">
              {addTaskButton}
            </ErrorTooltip>
          ) : (
            <CreateTaskFormDialog boardId={boardId} status={status}>
              {addTaskButton}
            </CreateTaskFormDialog>
          )}
        </div>
      </div>
      <Droppable
        className="p-1 h-fit mb-4 rounded-sm bg-gray-50 border min-h-[100px]"
        id={status}
      >
        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          tasks.map((task, index) => (
            <SortableTask
              key={task.id}
              task={task}
              index={index}
              group={status}
            />
          ))
        )}
      </Droppable>
    </div>
  );
}
