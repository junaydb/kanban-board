import { Droppable } from "./Droppable";
import { SortableTask } from "./SortableTask";
import { Spinner } from "@/shadcn/ui/spinner";
import type { TaskStatusEnum, TTask } from "@backend/util/types";

type Props = {
  tasks: TTask[];
  status: TaskStatusEnum;
  isPending?: boolean;
};

function getStatusProps(status: TaskStatusEnum) {
  const statusMapper = {
    TODO: {
      text: "To-do",
      colour: "#fff",
    },
    IN_PROGRESS: {
      text: "In progress",
      colour: "#fff",
    },
    DONE: {
      text: "Done",
      colour: "#fff",
    },
  };

  return statusMapper[status];
}

export function Column({ tasks, status, isPending }: Props) {
  const statusProps = getStatusProps(status);

  return (
    <div className="h-fit">
      <h2 className="font-medium text-lg p-1">{statusProps.text}</h2>
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
            <SortableTask key={task.id} task={task} index={index} group={status} />
          ))
        )}
      </Droppable>
    </div>
  );
}
