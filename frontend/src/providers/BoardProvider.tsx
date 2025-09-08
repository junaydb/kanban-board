import { createContext, useContext, useState } from "react";

type SetBoard = (board: number) => void;

const BoardContext = createContext<number | null>(null);
const SetBoardContext = createContext<SetBoard>(() => {});

export function useBoard() {
  return useContext(BoardContext);
}
export function useSetBoard() {
  return useContext(BoardContext);
}

function BoardProvider({ children }: { children: React.ReactNode }) {
  const [board, setBoard] = useState<number | null>(null);

  return (
    <BoardContext value={board}>
      <SetBoardContext value={setBoard}>{children}</SetBoardContext>
    </BoardContext>
  );
}

export default BoardProvider;
