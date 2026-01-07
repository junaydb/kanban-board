import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TTask } from "@backend/util/types";
import { Task } from "./Task";

type SortableTaskProps = {
  task: TTask;
  isOverlay?: boolean;
};

export function SortableTask({ task, isOverlay = false }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Task
      ref={setNodeRef}
      task={task}
      isOverlay={isOverlay}
      isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
