import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useGetTaskPage } from "@/trpc/task-hooks";
import { toast } from "sonner";
import type { PageQuery } from "@backend/util/types";

export function Column({
  boardId,
  status,
  pageSize,
}: Omit<PageQuery, "sortBy" | "sortOrder">) {
  const [sortBy, setSortBy] = useState<PageQuery["sortBy"]>("created");
  const [sortOrder, setSortOrder] = useState<PageQuery["sortOrder"]>("ASC");
  const {
    data,
    isLoading,
    isPending,
    isSuccess,
    isFetchingNextPage,
    hasNextPage,
    isError,
  } = useGetTaskPage({
    boardId,
    status,
    sortBy,
    sortOrder,
    pageSize,
  });

  if (isError) {
    toast.error("An error occurred whilst fetching tasks");
  }

  if (isLoading) {
    // TODO: render skeleton loading ui
  }

  if (isSuccess) {
    const tasks = data.pages.map(({ data }) => data.tasks).flat();
    const taskIds = tasks.map(({ id }) => id);

    console.log(data);

    return (
      <DndContext>
        <SortableContext items={taskIds}>
          {/* Task cards go here */}
        </SortableContext>
      </DndContext>
    );
  }
}
