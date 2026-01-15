import { useState, useRef, useEffect } from "react";
import { useUpdateBoardTitle } from "@/trpc/board-hooks";
import { toast } from "sonner";
import { cn } from "@/shadcn/utils";
import { BoardTitleSchema } from "@backend/routes/_validators";
import { Skeleton } from "@/shadcn/ui/skeleton";

type BoardTitleProps = {
  boardId: number;
  title: string;
};

export function BoardTitle({ boardId, title }: BoardTitleProps) {
  const { mutate: updateTitle, isPending: isUpdating } = useUpdateBoardTitle();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    const trimmedValue = editValue.trim();

    const titleValidator = BoardTitleSchema.safeParse({ title: trimmedValue });
    if (!titleValidator.success) {
      toast.error(titleValidator.error.issues[0].message);
      setEditValue(title);
      setIsEditing(false);
      return;
    }
    if (trimmedValue === title) {
      setIsEditing(false);
      return;
    }

    updateTitle(
      { boardId, title: trimmedValue },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated");
        },
        onError: (error) => {
          if (error.data?.code === "CONFLICT") {
            toast.error("A board with this title already exists");
          } else {
            toast.error("Failed to update board title");
          }
          setEditValue(title);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isUpdating}
        maxLength={50}
        className={cn(
          "mt-2 ml-2 w-fit field-sizing-content text-2xl font-semibold bg-transparent border-2 border-muted-foreground/50 rounded-md px-1 outline-none",
          isUpdating && "opacity-50",
        )}
      />
    );
  }

  return (
    <h1
      onClick={handleStartEditing}
      className="mt-2 ml-2 w-fit text-2xl font-semibold cursor-text hover:text-muted-foreground transition-colors border-2 border-transparent rounded px-1"
    >
      {title}
    </h1>
  );
}

export function BoardTitleSkeleton() {
  return <Skeleton className="mt-2 ml-2 h-9 w-48 rounded-md" />;
}
