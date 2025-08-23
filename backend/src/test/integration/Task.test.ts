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
import { tasks, boards, users } from "../../main/db/schema.js";
import type {
  TaskStatusEnum,
  CreateTaskParams,
} from "../../main/util/types.js";
import { eq } from "drizzle-orm";

let TEST_BOARD_ID: number;
let TEST_USER_ID: string;
const NON_EXISTENT_TASK_ID = 99999;
const PAGE_SIZE = 5;

describe("Task model", () => {
  beforeAll(async () => {
    expect(process.env.DB_PROD, "DB_PROD should be 'false' during tests").toBe(
      "false",
    );

    // Create test user and board for all tests
    const testUser = await db
      .insert(users)
      .values({
        id: "test-user-integration",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
      })
      .returning();
    TEST_USER_ID = testUser[0].id;

    const testBoard = await db
      .insert(boards)
      .values({
        title: "Test Board",
        userId: TEST_USER_ID,
      })
      .returning();
    TEST_BOARD_ID = testBoard[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
    await db.delete(boards).where(eq(boards.id, TEST_BOARD_ID));
    await db.delete(users).where(eq(users.id, TEST_USER_ID));
  });

  describe("getAllFromBoard", () => {
    beforeEach(async () => {
      // Clean up any existing tasks
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));

      // Create test tasks
      await db.insert(tasks).values([
        {
          title: "Task 1",
          description: "Description 1",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
          boardId: TEST_BOARD_ID,
        },
        {
          title: "Task 2",
          description: "Description 2",
          status: "IN_PROGRESS" as TaskStatusEnum,
          dueDate: new Date("2025-01-02"),
          boardId: TEST_BOARD_ID,
        },
      ]);
    });

    it("Should return all tasks for a board, ordered by created_at (descending)", async () => {
      const result = await Task.getAllFromBoard({ boardId: TEST_BOARD_ID });

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result![0].createdAt.getTime()).toBeGreaterThanOrEqual(
        result![1].createdAt.getTime(),
      );
    });

    it("Should return null when board has no tasks", async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      const result = await Task.getAllFromBoard({ boardId: TEST_BOARD_ID });
      expect(result).toBeNull();
    });
  });

  describe("getNumTasks", () => {
    beforeEach(async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      await db.insert(tasks).values([
        {
          title: "Task 1",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
          boardId: TEST_BOARD_ID,
        },
        {
          title: "Task 2",
          status: "DONE" as TaskStatusEnum,
          dueDate: new Date("2025-01-02"),
          boardId: TEST_BOARD_ID,
        },
      ]);
    });

    it("Should return the number of tasks for a board", async () => {
      const result = await Task.getNumTasks({ boardId: TEST_BOARD_ID });
      expect(result).toBe(2);
    });
  });

  describe("getTasksByCreated", () => {
    beforeEach(async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      // Create multiple TODO tasks for pagination testing
      const taskPromises = [];
      for (let i = 0; i < 10; i++) {
        taskPromises.push(
          db.insert(tasks).values({
            title: `Task ${i + 1}`,
            status: "TODO" as TaskStatusEnum,
            dueDate: new Date(`2025-01-${String(i + 1).padStart(2, "0")}`),
            boardId: TEST_BOARD_ID,
          }),
        );
        // Add small delay to ensure different created_at times
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      await Promise.all(taskPromises);
    });

    it("Should return tasks ordered by createdAt (descending)", async () => {
      const result = await Task.getTasksByCreated({
        sortOrder: "DESC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      expect(result![0].createdAt.getTime()).toBeGreaterThanOrEqual(
        result![1].createdAt.getTime(),
      );
      if (result![0].createdAt.getTime() === result![1].createdAt.getTime()) {
        expect(result![0].id).toBeGreaterThan(result![1].id);
      }
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
      expect(result![0].createdAt.getTime()).toBeLessThanOrEqual(
        result![1].createdAt.getTime(),
      );
      if (result![0].createdAt.getTime() === result![1].createdAt.getTime()) {
        expect(result![0].id).toBeLessThan(result![1].id);
      }
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
      expect(secondPage!).toHaveLength(PAGE_SIZE);
      expect(secondPage![0].createdAt.getTime()).toBeLessThanOrEqual(
        lastTask.createdAt.getTime(),
      );
      if (secondPage![0].createdAt.getTime() === lastTask.createdAt.getTime()) {
        expect(secondPage![0].id).toBeLessThan(lastTask.id);
      }
    });
  });

  describe("getTasksByDueDate", () => {
    beforeEach(async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      // Create multiple TODO tasks with different due dates
      const taskPromises = [];
      for (let i = 0; i < 10; i++) {
        taskPromises.push(
          db.insert(tasks).values({
            title: `Task ${i + 1}`,
            status: "TODO" as TaskStatusEnum,
            dueDate: new Date(`2025-01-${String(i + 1).padStart(2, "0")}`),
            boardId: TEST_BOARD_ID,
          }),
        );
      }
      await Promise.all(taskPromises);
    });

    it("Should return tasks ordered by dueDate (descending)", async () => {
      const result = await Task.getTasksByDueDate({
        sortOrder: "DESC",
        status: "TODO" as TaskStatusEnum,
        pageSize: PAGE_SIZE,
        boardId: TEST_BOARD_ID,
      });

      expect(result).not.toBeNull();
      expect(result!).toHaveLength(PAGE_SIZE);
      expect(result![0].dueDate.getTime()).toBeGreaterThanOrEqual(
        result![1].dueDate.getTime(),
      );
      if (result![0].dueDate.getTime() === result![1].dueDate.getTime()) {
        expect(result![0].id).toBeGreaterThan(result![1].id);
      }
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
      expect(result![0].dueDate.getTime()).toBeLessThanOrEqual(
        result![1].dueDate.getTime(),
      );
      if (result![0].dueDate.getTime() === result![1].dueDate.getTime()) {
        expect(result![0].id).toBeLessThan(result![1].id);
      }
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
      expect(secondPage!).toHaveLength(PAGE_SIZE);
      expect(secondPage![0].dueDate.getTime()).toBeGreaterThanOrEqual(
        lastTask.dueDate.getTime(),
      );
      if (secondPage![0].dueDate.getTime() === lastTask.dueDate.getTime()) {
        expect(secondPage![0].id).toBeGreaterThan(lastTask.id);
      }
    });
  });

  describe("findById", () => {
    let testTaskId: number;

    beforeEach(async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      const [testTask] = await db
        .insert(tasks)
        .values({
          title: "Test Task for FindById",
          description: "Test description",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
          boardId: TEST_BOARD_ID,
        })
        .returning();
      testTaskId = testTask.id;
    });

    it("Should return the task with the passed in id", async () => {
      const result = await Task.findById({ taskId: testTaskId });
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testTaskId);
      expect(result!.title).toBe("Test Task for FindById");
      expect(result!.description).toBe("Test description");
    });

    it("Should return null if the task does not exist", async () => {
      const result = await Task.findById({ taskId: NON_EXISTENT_TASK_ID });
      expect(result).toBeNull();
    });
  });

  describe("updateStatus", () => {
    let testTaskId: number;

    beforeEach(async () => {
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      const [testTask] = await db
        .insert(tasks)
        .values({
          title: "Temp Task for Update",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
          boardId: TEST_BOARD_ID,
        })
        .returning();
      testTaskId = testTask.id;
    });

    it("Should update the status of the task and return the updated status", async () => {
      const newStatus = "DONE" as TaskStatusEnum;
      const params = { taskId: testTaskId, newStatus };

      const result = await Task.updateStatus(params);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(newStatus);

      // Verify the change in the database
      const updatedTask = await Task.findById({ taskId: testTaskId });
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
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
      const [testTask] = await db
        .insert(tasks)
        .values({
          title: "Temp Task for Delete",
          status: "TODO" as TaskStatusEnum,
          dueDate: new Date("2025-01-01"),
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
      // Clean up any created tasks
      await db.delete(tasks).where(eq(tasks.boardId, TEST_BOARD_ID));
    });

    it("Should save the passed in task in the database and return the task", async () => {
      const newTaskData: CreateTaskParams = {
        title: "New Task Created",
        description: "Created Description",
        status: "TODO" as TaskStatusEnum,
        dueDate: new Date("2025-08-01"),
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
