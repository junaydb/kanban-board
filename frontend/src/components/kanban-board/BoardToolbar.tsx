import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/shadcn/ui/dropdown-menu";
import { Button } from "@/shadcn/ui/button";
import { BrushCleaning } from "lucide-react";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { SortParams } from "@backend/util/types";

type SortBy = Exclude<SortParams["sortBy"], "position">;

interface BoardToolbarProps {
  setSortBy: (value: SortBy) => void;
  setSortOrder: (value: SortParams["sortOrder"]) => void;
}

const sortByLabels: Record<SortBy, string> = {
  dueDate: "Due date",
  created: "Created",
};

export function BoardToolbar({ setSortBy, setSortOrder }: BoardToolbarProps) {
  function handleSortSelect(
    sortByValue: SortBy,
    sortOrderValue: SortParams["sortOrder"],
  ) {
    setSortBy(sortByValue);
    setSortOrder(sortOrderValue);
  }

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
              <DropdownMenuSub key={key}>
                <DropdownMenuSubTrigger>
                  {sortByLabels[key]}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => handleSortSelect(key, "ASC")}
                  >
                    Ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortSelect(key, "DESC")}
                  >
                    Descending
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
