import { useSortable } from "@dnd-kit/react/sortable";
import type { TTask, TaskStatusEnum } from "@backend/util/types";
import { Task } from "./Task";

type SortableTaskProps = {
  task: TTask;
  index: number;
  group: TaskStatusEnum;
};

export function SortableTask({ task, index, group }: SortableTaskProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group,
    type: "task",
    accept: "task",
    data: { task, status: task.status },
  });

  return <Task ref={ref} handleRef={handleRef} task={task} isDragging={isDragging} />;
}
