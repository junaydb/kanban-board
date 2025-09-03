import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetAllTasks } from "@/util/hooks";
import { Search } from "lucide-react";
import TaskCard from "./TaskCard";
import LoadingSpinner from "../decorative/LoadingSpinner";

interface Props {
  boardId: number;
}

function SearchModal({ boardId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useGetAllTasks({ boardId });

  const allTasks = data?.data.tasks || [];

  const filteredTasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4" />
          Search tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Search Tasks</DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 pb-4">
          <Input
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading tasks. Please try again.
            </div>
          ) : searchTerm.trim() === "" ? (
            <div className="text-center py-8 text-muted-foreground">
              Enter a search term to find tasks
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal;
