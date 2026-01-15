import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Button } from "@/shadcn/ui/button";
import { BrushCleaning } from "lucide-react";
import type { PageQuery } from "@backend/util/types";
import { Skeleton } from "@/shadcn/ui/skeleton";

type SortBy = PageQuery["sortBy"];

interface BoardToolbarProps {
  setSortBy: (value: SortBy) => void;
  sortOrder: PageQuery["sortOrder"];
  setSortOrder: (value: PageQuery["sortOrder"]) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
}

const sortByLabels: Record<Exclude<SortBy, "position">, string> = {
  dueDate: "Due date",
  created: "Created",
};

export function BoardToolbar({ setSortBy }: BoardToolbarProps) {
  return (
    <div className="flex items-center gap-2 mx-3 mt-3 p-2 rounded-sm bg-gray-50 border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <BrushCleaning className="h-4 w-4" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(Object.keys(sortByLabels) as (keyof typeof sortByLabels)[]).map(
            (key) => (
              <DropdownMenuItem key={key} onClick={() => setSortBy(key)}>
                {sortByLabels[key]}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function BoardToolbarSkeleton() {
  return <Skeleton className="mx-3 mt-3 h-12 rounded-sm" />;
}
