import { useGetNextPage } from "@/util/hooks";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import LoadingSpinner from "../decorative/LoadingSpinner";
import type { Status } from "@/util/types";

type ColumnProp = {
  title: string;
  className: string;
};

const columnProps: Record<Status, ColumnProp> = {
  TODO: {
    title: "To do",
    className: "border-gray-300 bg-gray-50",
  },
  IN_PROGRESS: {
    title: "In progress",
    className: "border-blue-300 bg-blue-50",
  },
  DONE: {
    title: "Done",
    className: "border-green-300 bg-green-50",
  },
};

function ColumnContainer({
  colProps,
  children,
}: {
  colProps: ColumnProp;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${colProps.className} flex flex-col h-full min-h-[600px] rounded-xs border-2 p-4`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{colProps.title}</h3>
      </div>
      {children}
    </div>
  );
}

interface Props {
  status: Status;
}

function TaskColumn({ status }: Props) {
  const { isPending, data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetNextPage({
      status,
      sortBy: "created",
      sortOrder: "DESC",
      // Hardcode these for now
      pageSize: 10,
      boardId: 1,
    });

  const props = columnProps[status];
  const { ref, inView } = useInView();

  const allTasks = data?.pages.flatMap((page) => page.data.tasks) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <ColumnContainer colProps={props}>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ColumnContainer>
    );
  }

  return (
    <ColumnContainer colProps={props}>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {allTasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No tasks yet
          </div>
        ) : (
          <>
            {allTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {hasNextPage && (
              <div ref={ref} className="flex items-center justify-center py-4">
                {isFetchingNextPage && <LoadingSpinner />}
              </div>
            )}
          </>
        )}
      </div>
    </ColumnContainer>
  );
}

export default TaskColumn;
