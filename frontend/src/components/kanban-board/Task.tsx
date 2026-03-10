import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { Badge } from "@/shadcn/ui/badge";
import { cn } from "@/shadcn/utils";
import type { TTask } from "@backend/util/types";
import { Calendar, Clock, GripVertical } from "lucide-react";

type TaskProps = HTMLAttributes<HTMLDivElement> & {
  task: TTask;
  isOverlay?: boolean;
  isDragging?: boolean;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  handleRef?: (element: Element | null) => void;
};

export function Task({
  task,
  isOverlay = false,
  isDragging = false,
  style,
  className,
  ref,
  handleRef,
  ...props
}: TaskProps) {
  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "bg-white rounded-sm border shadow-sm p-3 m-2",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg ring-2 ring-primary",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-1">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <button
          ref={handleRef as Ref<HTMLButtonElement>}
          className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag handle"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
