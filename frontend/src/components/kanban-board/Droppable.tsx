import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

export function Droppable({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref } = useDroppable({
    id: id,
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
