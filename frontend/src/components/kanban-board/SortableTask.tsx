import { useSortable } from "@dnd-kit/react/sortable";
import type { TTask, TaskStatusEnum } from "@backend/util/types";
import { Task } from "./Task";

type SortableTaskProps = {
  task: TTask;
  index: number;
  group: TaskStatusEnum;
};

export function SortableTask({ task, index, group }: SortableTaskProps) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    group,
    data: { task },
  });

  return (
    <Task
      ref={ref}
      task={task}
      isDragging={isDragging}
    />
  );
}
