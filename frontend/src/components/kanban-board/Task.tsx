import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/shadcn/ui/badge";
import { cn } from "@/shadcn/utils";
import { Calendar, Clock } from "lucide-react";
import type { TTask } from "@backend/util/types";

type TaskProps = {
  task: TTask;
  isOverlay?: boolean;
};

export function Task({ task, isOverlay = false }: TaskProps) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white rounded-sm border shadow-sm p-3 cursor-grab active:cursor-grabbing m-2",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg ring-2 ring-primary",
      )}
    >
      <h4 className="font-medium text-sm mb-1">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Created {formatDate(task.createdAt)}</span>

        {task.dueDate && (
          <Badge variant="secondary" className="text-xs">
            <Calendar className="size-3" />
            {formatDate(task.dueDate)}
          </Badge>
        )}

        {task.dueTime && (
          <Badge variant="outline" className="text-xs">
            <Clock className="size-3" />
            {formatTime(task.dueTime)}
          </Badge>
        )}
      </div>
    </div>
  );
}
