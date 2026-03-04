import { Droppable } from "./Droppable";
import { SortableTask } from "./SortableTask";
import { Spinner } from "@/shadcn/ui/spinner";
import { getStatusProps } from "@/util/helpers";
import type { TaskStatusEnum, TTask } from "@backend/util/types";

type Props = {
  tasks: TTask[];
  status: TaskStatusEnum;
  isPending?: boolean;
};

export function Column({ tasks, status, isPending }: Props) {
  const statusProps = getStatusProps(status);

  return (
    <div className="h-fit">
      <div className="flex items-center justify-between p-1">
        <h2 className="font-medium text-lg">{statusProps.text}</h2>
        <span className="text-sm text-gray-500">{tasks.length}</span>
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
