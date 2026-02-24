import { useDroppable } from "@dnd-kit/react";

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
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
