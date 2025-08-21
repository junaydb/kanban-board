import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { pool } from "../../main/db/index.js";
import Task from "../../main/models/Task.js";
import { NotFoundError } from "../../main/util/errors.js";
import type {
  status,
  IInsertTaskParams,
} from "../../main/queries/taskQueries.queries.js";
import { insertTask } from "../../main/queries/taskQueries.queries.js";

const TASK_COUNT = 50;
const KNOWN_TASK_ID = 5;
const NON_EXISTENT_TASK_ID = 99999;
const PAGE_SIZE = 5;

describe("Task model", () => {
  beforeAll(() => {
    expect(process.env.DB_PROD, "DB_PROD should be 'false' during tests").toBe(
      "false",
    );
  });

  afterAll(async () => {
    await pool.end();
    console.log("Database pool closed.");
  });

  describe("getAll", () => {
    it("Should return all tasks, ordered by created_at (descending)", async () => {
      const result = await Task.getAll();

      expect(result).toHaveLength(TASK_COUNT);
      expect(result[0].id).toBe(TASK_COUNT);
      expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(
        result[1].created_at.getTime(),
      );
    });
  });

  describe("getNumTasks", () => {
    it("Should return the number of tasks in the database", async () => {
      const result = await Task.getNumTasks();
      expect(result).toBe(TASK_COUNT);
    });
  });

  describe("getTasksByCreated", () => {
    const pageParams = { status: "TODO" as status, pageSize: PAGE_SIZE };

    it("Should return tasks ordered by created_at (descending)", async () => {
      const result = await Task.getTasksByCreated("DESC", pageParams);

      expect(result).toHaveLength(PAGE_SIZE);
      expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(
        result[1].created_at.getTime(),
      );
      if (result[0].created_at.getTime() === result[1].created_at.getTime()) {
        expect(result[0].id).toBeGreaterThan(result[1].id);
      }
    });

    it("Should return tasks ordered by created_at (ascending)", async () => {
      const result = await Task.getTasksByCreated("ASC", pageParams);

      expect(result).toHaveLength(PAGE_SIZE);
      expect(result[0].created_at.getTime()).toBeLessThanOrEqual(
        result[1].created_at.getTime(),
      );
      if (result[0].created_at.getTime() === result[1].created_at.getTime()) {
        expect(result[0].id).toBeLessThan(result[1].id);
      }
    });

    it("Should handle pagination correctly (descending)", async () => {
      const firstPage = await Task.getTasksByCreated("DESC", pageParams);
      expect(firstPage).toHaveLength(PAGE_SIZE);

      // Get second page using cursor
      const lastTask = firstPage[PAGE_SIZE - 1];
      const secondPageParams = {
        status: "TODO" as status,
        pageSize: PAGE_SIZE,
        prevCreatedAt: lastTask.created_at.toISOString(),
        prevId: lastTask.id,
      };
      const secondPage = await Task.getTasksByCreated("DESC", secondPageParams);

      expect(secondPage).toHaveLength(PAGE_SIZE);
      expect(secondPage[0].created_at.getTime()).toBeLessThanOrEqual(
        lastTask.created_at.getTime(),
      );
      if (
        secondPage[0].created_at.getTime() === lastTask.created_at.getTime()
      ) {
        expect(secondPage[0].id).toBeLessThan(lastTask.id);
      }
    });
  });

  describe("getTasksByDueDate", () => {
    const pageParams = { status: "TODO" as status, pageSize: PAGE_SIZE };

    it("Should return tasks ordered by due_date (descending)", async () => {
      const result = await Task.getTasksByDueDate("DESC", pageParams);

      expect(result).toHaveLength(PAGE_SIZE);
      expect(result[0].due_date.getTime()).toBeGreaterThanOrEqual(
        result[1].due_date.getTime(),
      );
      if (result[0].due_date.getTime() === result[1].due_date.getTime()) {
        expect(result[0].id).toBeGreaterThan(result[1].id);
      }
    });

    it("Should return tasks ordered by due_date (ascending)", async () => {
      const result = await Task.getTasksByDueDate("ASC", pageParams);

      expect(result).toHaveLength(PAGE_SIZE);
      expect(result[0].due_date.getTime()).toBeLessThanOrEqual(
        result[1].due_date.getTime(),
      );
      if (result[0].due_date.getTime() === result[1].due_date.getTime()) {
        expect(result[0].id).toBeLessThan(result[1].id);
      }
    });

    it("Should handle pagination correctly (ascending)", async () => {
      const firstPage = await Task.getTasksByDueDate("ASC", pageParams);
      expect(firstPage).toHaveLength(PAGE_SIZE);

      // Get second page using cursor
      const lastTask = firstPage[PAGE_SIZE - 1];
      const secondPageParams = {
        status: "TODO" as status,
        pageSize: PAGE_SIZE,
        prevDueDate: lastTask.due_date.toISOString(),
        prevId: lastTask.id,
      };
      const secondPage = await Task.getTasksByDueDate("ASC", secondPageParams);

      expect(secondPage).toHaveLength(PAGE_SIZE);
      expect(secondPage[0].due_date.getTime()).toBeGreaterThanOrEqual(
        lastTask.due_date.getTime(),
      );
      if (secondPage[0].due_date.getTime() === lastTask.due_date.getTime()) {
        expect(secondPage[0].id).toBeGreaterThan(lastTask.id);
      }
    });
  });

  describe("findById", () => {
    it("Should return the task with the passed in id", async () => {
      const result = await Task.findById({ taskId: KNOWN_TASK_ID });
      expect(result).toBeDefined();
      expect(result.id).toBe(KNOWN_TASK_ID);
      expect(result.title).toBe("Draft proposal E-005");
    });

    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      await expect(
        Task.findById({ taskId: NON_EXISTENT_TASK_ID }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateStatus", () => {
    it("Should update the status of the task and return the updated status", async () => {
      // Insert temp task
      const tempTaskData: IInsertTaskParams = {
        title: "Temp Task for Update",
        status: "TODO",
        due_date: new Date().toISOString(),
      };
      const saved = await insertTask.run(tempTaskData, pool);
      const tempTaskId = saved[0].id;

      const newStatus = "DONE" as status;
      const params = { taskId: tempTaskId, newStatus };

      const result = await Task.updateStatus(params);
      expect(result).toEqual({ status: newStatus });

      // Verify the change in the database
      const updatedTask = await Task.findById({ taskId: tempTaskId });
      expect(updatedTask.status).toBe(newStatus);

      // Cleanup
      await Task.delete({ taskId: tempTaskId });
    });

    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      const params = {
        taskId: NON_EXISTENT_TASK_ID,
        newStatus: "DONE" as status,
      };
      await expect(Task.updateStatus(params)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("delete", () => {
    let tempTaskId: number;

    it("Should delete the task with the passed in id from the database and return 1", async () => {
      // Insert temp task
      const tempTaskData: IInsertTaskParams = {
        title: "Temp Task for Delete",
        status: "TODO",
        due_date: new Date().toISOString(),
      };
      const saved = await insertTask.run(tempTaskData, pool);

      tempTaskId = saved[0].id;
      const params = { taskId: tempTaskId };

      const result = await Task.delete(params);
      expect(result).toBe(1);

      await expect(Task.findById({ taskId: tempTaskId })).rejects.toThrow(
        NotFoundError,
      );
    });

    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      const params = { taskId: NON_EXISTENT_TASK_ID };
      await expect(Task.delete(params)).rejects.toThrow(NotFoundError);
    });
  });

  describe("save", () => {
    let savedTaskId: number | null = null;

    it("Should save the passed in task in the database and return the task", async () => {
      const newTaskData: IInsertTaskParams = {
        title: "New Task Saved",
        description: "Saved Description",
        status: "TODO" as status,
        due_date: "2025-08-01T12:00:00.000Z",
      };

      const savedTask = await Task.save(newTaskData);
      savedTaskId = savedTask.id; // For cleanup

      expect(savedTask.id).toBeGreaterThan(0);
      expect(savedTask.title).toBe(newTaskData.title);
      expect(savedTask.description).toBe(newTaskData.description);
      expect(savedTask.status).toBe(newTaskData.status);
      expect(savedTask.due_date.toISOString()).toBe(newTaskData.due_date);
      expect(savedTask.created_at).toBeInstanceOf(Date);

      // Ensure task is stored in database
      const fetchedTask = await Task.findById({ taskId: savedTask.id });
      expect(fetchedTask).toEqual(savedTask);

      // Cleanup
      await Task.delete({ taskId: savedTaskId! });
    });
  });
});
