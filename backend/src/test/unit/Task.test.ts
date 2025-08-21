import { describe, expect, it, vi, afterEach } from "vitest";
import Task from "../../main/models/Task.js";
import { NotFoundError } from "../../main/util/errors.js";
import type { status } from "../../main/queries/taskQueries.queries.js";
import {
  getAllTasks,
  findById,
  updateStatus,
  deleteTask,
  getTasksByCreatedDesc,
  getTasksByCreatedAsc,
  getTasksByDueDateDesc,
  getTasksByDueDateAsc,
} from "../../main/queries/taskQueries.queries.js";

/*
 * Only includes tests for cases not covered by the integration tests,
 * which as of now is the just case of an empty database.
 *
 * The integration tests cover all other cases.
 */

vi.mock("../../main/queries/taskQueries.queries.js");

const mockRun = vi.fn();
vi.mocked(getAllTasks).run = mockRun;
vi.mocked(getTasksByCreatedDesc).run = mockRun;
vi.mocked(getTasksByCreatedAsc).run = mockRun;
vi.mocked(getTasksByDueDateDesc).run = mockRun;
vi.mocked(getTasksByDueDateAsc).run = mockRun;
vi.mocked(findById).run = mockRun;
vi.mocked(updateStatus).run = mockRun;
vi.mocked(deleteTask).run = mockRun;

describe("Task model", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("Should throw TaskNotFoundError() if there are no tasks", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.getAll()).rejects.toThrow(NotFoundError);
    });
  });

  describe("getTasksByCreated", () => {
    const pageParams = { status: "TODO" as status, pageSize: 10 };

    it("Should throw TaskNotFoundError() if there are no tasks (ascending)", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.getTasksByCreated("DESC", pageParams)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("Should throw TaskNotFoundError() if there are no tasks (ascending)", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.getTasksByCreated("ASC", pageParams)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getTasksByDueDate", () => {
    const pageParams = { status: "TODO" as status, pageSize: 10 };

    it("Should throw TaskNotFoundError() if there are no tasks DESC", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.getTasksByDueDate("DESC", pageParams)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("Should throw TaskNotFoundError() if there are no tasks (ascending)", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.getTasksByDueDate("ASC", pageParams)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("findById", () => {
    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      mockRun.mockResolvedValue([]);

      await expect(Task.findById({ taskId: 999 })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateStatus", () => {
    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      const params = { taskId: 999, newStatus: "DONE" as status };

      mockRun.mockResolvedValue([]);
      await expect(Task.updateStatus(params)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("delete", () => {
    it("Should throw TaskNotFoundError() if the task does not exist", async () => {
      const params = { taskId: 999 };

      mockRun.mockResolvedValue([]);

      await expect(Task.delete(params)).rejects.toThrow(NotFoundError);
    });
  });
});
