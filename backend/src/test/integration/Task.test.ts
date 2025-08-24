import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import db from "../../main/db/index.js";
import Task from "../../main/models/Task.js";
import { tasks, boards } from "../../main/db/schema.js";
import type {
  TaskStatusEnum,
  CreateTaskParams,
} from "../../main/util/types.js";
import { eq } from "drizzle-orm";

let TEST_BOARD_ID: number;
const NON_EXISTENT_TASK_ID = 99999;
const PAGE_SIZE = 5;

describe("Task model", () => {
  beforeAll(async () => {
    expect(process.env.DB_PROD, "DB_PROD should be 'false' during tests").toBe(
      "false",
    );

    // Get the first available board ID (should be seeded board, but could be different)
    const allBoards = await db.select().from(boards);
    if (allBoards.length === 0) {
      throw new Error(
        "No boards found in test database. Seeding may have failed.",
      );
    }
    TEST_BOARD_ID = allBoards[0].id;
  });

  afterAll(async () => {
    // Clean up only test-created tasks, leave seeded data intact
    await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
  });

  describe("getAllFromBoard", () => {
    it("Should return all tasks for a board, ordered by created_at (descending)", async () => {
      const result = await Task.getAll({ boardId: TEST_BOARD_ID });

      expect(result).not.toBeNull();
      expect(result).toHaveLength(20); // Seeded tasks
      // Verify descending order by creation time
      for (let i = 0; i < result!.length - 1; i++) {
        expect(result![i].createdAt.getTime()).toBeGreaterThanOrEqual(
          result![i + 1].createdAt.getTime(),
        );
      }
      // Check that we have the expected seeded tasks
      expect(result![0].title).toBe("Deploy to staging environment"); // Last created
      expect(result![result!.length - 1].title).toBe("Design homepage layout"); // First created
    });

    it("Should return null when board has no tasks", async () => {
      // Use a non-existent board ID to test null case
      const result = await Task.getAll({ boardId: 999 });
      expect(result).toBeNull();
    });
  });

  describe("getNumTasks", () => {
    it("Should return the number of tasks for a board", async () => {
      const result = await Task.getNumTasks({ boardId: TEST_BOARD_ID });
      expect(result).toBe(20); // Seeded tasks count
    });
  });

  describe("getTasksByCreated", () => {
    it("Should return tasks ordered by createdAt (descending)", async () => {
      const result = await Task.getTasksByCreated({
        sortOrder: "DESC",
        status: "TODO",
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      // Verify descending order
      for (let i = 0; i < result!.length - 1; i++) {
        expect(result![i].createdAt.getTime()).toBeGreaterThanOrEqual(
          result![i + 1].createdAt.getTime(),
        );
        if (
          result![i].createdAt.getTime() === result![i + 1].createdAt.getTime()
        ) {
          expect(result![i].id).toBeGreaterThan(result![i + 1].id);
        }
      }
      // Verify all returned tasks are TODO
      result!.forEach((task) => {
        expect(task.status).toBe("TODO");
      });
    });

    it("Should return tasks ordered by createdAt (ascending)", async () => {
      const result = await Task.getTasksByCreated({
        sortOrder: "ASC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      // Verify ascending order
      for (let i = 0; i < result!.length - 1; i++) {
        expect(result![i].createdAt.getTime()).toBeLessThanOrEqual(
          result![i + 1].createdAt.getTime(),
        );
        if (
          result![i].createdAt.getTime() === result![i + 1].createdAt.getTime()
        ) {
          expect(result![i].id).toBeLessThan(result![i + 1].id);
        }
      }
      // Verify all returned tasks are TODO
      result!.forEach((task) => {
        expect(task.status).toBe("TODO");
      });
    });

    it("Should handle pagination correctly (descending)", async () => {
      const firstPage = await Task.getTasksByCreated({
        sortOrder: "DESC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });
      expect(firstPage).not.toBeNull();
      expect(firstPage!).toHaveLength(PAGE_SIZE);

      // Get second page using cursor
      const lastTask = firstPage![PAGE_SIZE - 1];
      const secondPage = await Task.getTasksByCreated({
        sortOrder: "DESC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
        cursor: {
          prevCreatedAt: lastTask.createdAt,
          prevId: lastTask.id,
        },
      });

      expect(secondPage).not.toBeNull();
      expect(secondPage!).toHaveLength(3); // Remaining TODO tasks (8 total - 5 from first page)
      expect(secondPage![0].createdAt.getTime()).toBeLessThanOrEqual(
        lastTask.createdAt.getTime(),
      );
      if (secondPage![0].createdAt.getTime() === lastTask.createdAt.getTime()) {
        expect(secondPage![0].id).toBeLessThan(lastTask.id);
      }
    });
  });

  describe("getTasksByDueDate", () => {
    it("Should return tasks ordered by dueDate (descending)", async () => {
      const result = await Task.getTasksByDueDate({
        sortOrder: "DESC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      // Verify descending order by due date
      for (let i = 0; i < result!.length - 1; i++) {
        expect(result![i].dueDate.getTime()).toBeGreaterThanOrEqual(
          result![i + 1].dueDate.getTime(),
        );
        if (result![i].dueDate.getTime() === result![i + 1].dueDate.getTime()) {
          expect(result![i].id).toBeGreaterThan(result![i + 1].id);
        }
      }
      // Verify all returned tasks are TODO
      result!.forEach((task) => {
        expect(task.status).toBe("TODO");
      });
    });

    it("Should return tasks ordered by dueDate (ascending)", async () => {
      const result = await Task.getTasksByDueDate({
        sortOrder: "ASC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      // Verify ascending order by due date
      for (let i = 0; i < result!.length - 1; i++) {
        expect(result![i].dueDate.getTime()).toBeLessThanOrEqual(
          result![i + 1].dueDate.getTime(),
        );
        if (result![i].dueDate.getTime() === result![i + 1].dueDate.getTime()) {
          expect(result![i].id).toBeLessThan(result![i + 1].id);
        }
      }
      // Verify all returned tasks are TODO
      result!.forEach((task) => {
        expect(task.status).toBe("TODO");
      });
    });

    it("Should handle pagination correctly (ascending)", async () => {
      const firstPage = await Task.getTasksByDueDate({
        sortOrder: "ASC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });
      expect(firstPage).not.toBeNull();
      expect(firstPage!).toHaveLength(PAGE_SIZE);

      // Get second page using cursor
      const lastTask = firstPage![PAGE_SIZE - 1];
      const secondPage = await Task.getTasksByDueDate({
        sortOrder: "ASC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
        cursor: {
          prevDueDate: lastTask.dueDate,
          prevId: lastTask.id,
        },
      });

      expect(secondPage).not.toBeNull();
      expect(secondPage!).toHaveLength(3); // Remaining TODO tasks (8 total - 5 from first page)
      expect(secondPage![0].dueDate.getTime()).toBeGreaterThanOrEqual(
        lastTask.dueDate.getTime(),
      );
      if (secondPage![0].dueDate.getTime() === lastTask.dueDate.getTime()) {
        expect(secondPage![0].id).toBeGreaterThan(lastTask.id);
      }
    });
  });

  describe("findById", () => {
    it("Should return the task with the passed in id", async () => {
      // Use first seeded task (should have ID 1 based on seed file)
      const allTasks = await Task.getAll({ boardId: TEST_BOARD_ID });
      expect(allTasks).not.toBeNull();
      const firstTask = allTasks![0];

      const result = await Task.findById({ taskId: firstTask.id });
      expect(result).not.toBeNull();
      expect(result!.id).toBe(firstTask.id);
      expect(result!.title).toBe(firstTask.title);
      expect(result!.boardId).toBe(TEST_BOARD_ID);
    });

    it("Should return null if the task does not exist", async () => {
      const result = await Task.findById({ taskId: NON_EXISTENT_TASK_ID });
      expect(result).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("Should update the status of the task and return the updated status", async () => {
      // Find a TODO task from seeded data to update
      const allTasks = await Task.getAll({ boardId: TEST_BOARD_ID });
      expect(allTasks).not.toBeNull();
      const todoTask = allTasks!.find((task) => task.status === "TODO");
      expect(todoTask).toBeDefined();

      const newStatus = "DONE" as TaskStatusEnum;
      const params = { taskId: todoTask!.id, newStatus };

      const result = await Task.updateStatus(params);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(newStatus);

      // Verify the change in the database
      const updatedTask = await Task.findById({ taskId: todoTask!.id });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.status).toBe(newStatus);
    });

    it("Should return null if the task does not exist", async () => {
      const params = {
        taskId: NON_EXISTENT_TASK_ID,
        newStatus: "DONE" as TaskStatusEnum,
      };
      const result = await Task.updateStatus(params);
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    let testTaskId: number;

    beforeEach(async () => {
      // Create a dedicated task for deletion (don't delete seeded data)
      const [testTask] = await db
        .insert(tasks)
        .values({
          title: "Temp Task for Delete",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
          hasDueTime: false,
          boardId: TEST_BOARD_ID,
        })
        .returning();
      testTaskId = testTask.id;
    });

    it("Should delete the task with the passed in id from the database and return the deleted task", async () => {
      const params = { taskId: testTaskId };

      const result = await Task.delete(params);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testTaskId);

      // Verify task was deleted
      const deletedTask = await Task.findById({ taskId: testTaskId });
      expect(deletedTask).toBeNull();
    });

    it("Should return null if the task does not exist", async () => {
      const params = { taskId: NON_EXISTENT_TASK_ID };
      const result = await Task.delete(params);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    afterEach(async () => {
      // Clean up any test-created tasks, keep seeded data
      await db.delete(tasks).where(eq(tasks.title, "New Task Created"));
    });

    it("Should save the passed in task in the database and return the task", async () => {
      const newTaskData: CreateTaskParams = {
        title: "New Task Created",
        description: "Created Description",
        status: "TODO" as TaskStatusEnum,
        dueDate: new Date("2025-08-01"),
        hasDueTime: false,
        boardId: TEST_BOARD_ID,
      };

      const savedTask = await Task.create(newTaskData);

      expect(savedTask.id).toBeGreaterThan(0);
      expect(savedTask.title).toBe(newTaskData.title);
      expect(savedTask.description).toBe(newTaskData.description);
      expect(savedTask.status).toBe(newTaskData.status);
      expect(savedTask.dueDate.toDateString()).toBe(
        newTaskData.dueDate.toDateString(),
      );
      expect(savedTask.createdAt).toBeInstanceOf(Date);
      expect(savedTask.boardId).toBe(TEST_BOARD_ID);

      // Ensure task is stored in database
      const fetchedTask = await Task.findById({ taskId: savedTask.id });
      expect(fetchedTask).not.toBeNull();
      expect(fetchedTask!.id).toBe(savedTask.id);
      expect(fetchedTask!.title).toBe(savedTask.title);
    });
  });
});
