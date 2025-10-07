import { Status } from "./types";

/**
 * Local Storage solution for offline board and task management
 * Allows unauthenticated users to use the app and provides offline capabilities for authenticated users
 */

export interface LocalTask {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  dueDate: string; // ISO string
  hasDueTime: boolean;
  createdAt: string; // ISO string
  boardId: number;
}

export interface LocalBoard {
  id: number;
  title: string;
  createdAt: string; // ISO string
  userId: string | null; // null for anonymous users
}

interface LocalStorage {
  boards: LocalBoard[];
  tasks: LocalTask[];
  nextBoardId: number;
  nextTaskId: number;
}

// Storage keys
const STORAGE_KEY = "kanban_offline_data";
const SYNC_METADATA_KEY = "kanban_sync_metadata";

// Get storage data
function getStorage(): LocalStorage {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        boards: [],
        tasks: [],
        nextBoardId: 1,
        nextTaskId: 1,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse local storage:", error);
    return {
      boards: [],
      tasks: [],
      nextBoardId: 1,
      nextTaskId: 1,
    };
  }
}

// Save storage data
function saveStorage(data: LocalStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to local storage:", error);
    throw new Error("Failed to save data locally");
  }
}

// ==================== BOARD OPERATIONS ====================

/**
 * Get all boards for a user (or anonymous boards if userId is null)
 */
export function getLocalBoards(userId: string | null = null): LocalBoard[] {
  const storage = getStorage();
  return storage.boards.filter((board) => board.userId === userId);
}

/**
 * Get a specific board by ID
 */
export function getLocalBoard(boardId: number): LocalBoard | null {
  const storage = getStorage();
  return storage.boards.find((board) => board.id === boardId) || null;
}

/**
 * Create a new board
 */
export function createLocalBoard(
  title: string,
  userId: string | null = null,
): LocalBoard {
  const storage = getStorage();
  const newBoard: LocalBoard = {
    id: storage.nextBoardId,
    title,
    createdAt: new Date().toISOString(),
    userId,
  };

  storage.boards.push(newBoard);
  storage.nextBoardId++;
  saveStorage(storage);

  return newBoard;
}

/**
 * Update a board
 */
export function updateLocalBoard(
  boardId: number,
  updates: Partial<Pick<LocalBoard, "title">>,
): LocalBoard | null {
  const storage = getStorage();
  const boardIndex = storage.boards.findIndex((board) => board.id === boardId);

  if (boardIndex === -1) {
    return null;
  }

  storage.boards[boardIndex] = {
    ...storage.boards[boardIndex],
    ...updates,
  };

  saveStorage(storage);
  return storage.boards[boardIndex];
}

/**
 * Delete a board and all its tasks
 */
export function deleteLocalBoard(boardId: number): boolean {
  const storage = getStorage();
  const boardIndex = storage.boards.findIndex((board) => board.id === boardId);

  if (boardIndex === -1) {
    return false;
  }

  // Remove board
  storage.boards.splice(boardIndex, 1);

  // Remove all tasks associated with this board
  storage.tasks = storage.tasks.filter((task) => task.boardId !== boardId);

  saveStorage(storage);
  return true;
}

// ==================== TASK OPERATIONS ====================

/**
 * Get all tasks for a specific board
 */
export function getLocalTasks(boardId: number): LocalTask[] {
  const storage = getStorage();
  return storage.tasks.filter((task) => task.boardId === boardId);
}

/**
 * Get a specific task by ID
 */
export function getLocalTask(taskId: number): LocalTask | null {
  const storage = getStorage();
  return storage.tasks.find((task) => task.id === taskId) || null;
}

/**
 * Create a new task
 */
export function createLocalTask(
  taskData: Omit<LocalTask, "id" | "createdAt">,
): LocalTask {
  const storage = getStorage();
  const newTask: LocalTask = {
    id: storage.nextTaskId,
    ...taskData,
    createdAt: new Date().toISOString(),
  };

  storage.tasks.push(newTask);
  storage.nextTaskId++;
  saveStorage(storage);

  return newTask;
}

/**
 * Update a task
 */
export function updateLocalTask(
  taskId: number,
  updates: Partial<Omit<LocalTask, "id" | "createdAt" | "boardId">>,
): LocalTask | null {
  const storage = getStorage();
  const taskIndex = storage.tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  storage.tasks[taskIndex] = {
    ...storage.tasks[taskIndex],
    ...updates,
  };

  saveStorage(storage);
  return storage.tasks[taskIndex];
}

/**
 * Delete a task
 */
export function deleteLocalTask(taskId: number): boolean {
  const storage = getStorage();
  const taskIndex = storage.tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  storage.tasks.splice(taskIndex, 1);
  saveStorage(storage);
  return true;
}

/**
 * Export all data as JSON (for backup/debugging)
 */
export function exportLocalData(): string {
  const storage = getStorage();
  return JSON.stringify({ storage }, null, 2);
}

/**
 * Import data from JSON (for restore/debugging)
 */
export function importLocalData(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed.storage) {
      saveStorage(parsed.storage);
    }
    if (parsed.metadata) {
      localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(parsed.metadata));
    }
    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
}
