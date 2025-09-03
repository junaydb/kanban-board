import { createContext, useContext } from "react";

const BoardContext = createContext<number | null>(null);

export function useBoard() {
  return useContext(BoardContext);
}
