import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Button } from "@/shadcn/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { PageQuery } from "@backend/util/types";

type SortBy = PageQuery["sortBy"];
type SortOrder = PageQuery["sortOrder"];

interface BoardToolbarProps {
  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
}

const sortByLabels: Record<NonNullable<SortBy>, string> = {
  dueDate: "Due date",
  created: "Creation date",
  position: "User defined",
};

export function BoardToolbar({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: BoardToolbarProps) {
  return (
    <div className="flex items-center gap-2 mx-3 mt-3 p-2 rounded-sm bg-gray-50 border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort: {sortByLabels[sortBy ?? "position"]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <DropdownMenuRadioItem value="dueDate">
              Due date
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">
              Creation date
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="position">
              User defined
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
