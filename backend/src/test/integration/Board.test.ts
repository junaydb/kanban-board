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
import Board from "../../main/models/Board.js";
import { boards, tasks } from "../../main/db/schema.js";
import type {
  InsertBoardParams,
  UpdateBoardNameParams,
  BoardIdParams,
} from "../../main/util/types.js";
import { eq } from "drizzle-orm";

const TEST_USER_ID = "test-user-1"; // Use seeded user
const NON_EXISTENT_BOARD_ID = 99999;

describe("Board model", () => {
  beforeAll(async () => {
    expect(process.env.DB_PROD, "DB_PROD should be 'false' during tests").toBe(
      "false",
    );
  });

  afterAll(async () => {
    // Clean up any test-created boards (leave seeded data intact)
    await db.delete(boards).where(eq(boards.title, "Test Board Created"));
  });

  describe("create", () => {
    afterEach(async () => {
      // Clean up test-created boards
      await db.delete(boards).where(eq(boards.title, "Test Board Created"));
    });

    it("Should create a new board and return the board data", async () => {
      const newBoardData: InsertBoardParams = {
        title: "Test Board Created",
        userId: TEST_USER_ID,
      };

      const result = await Board.create(newBoardData);

      expect(result).toHaveLength(1);
      const savedBoard = result[0];
      expect(savedBoard.id).toBeGreaterThan(0);
      expect(savedBoard.title).toBe(newBoardData.title);
      expect(savedBoard.userId).toBe(newBoardData.userId);
      expect(savedBoard.createdAt).toBeInstanceOf(Date);

      // Verify the board exists in the database
      const boardsInDb = await db
        .select()
        .from(boards)
        .where(eq(boards.id, savedBoard.id));
      expect(boardsInDb).toHaveLength(1);
      expect(boardsInDb[0].title).toBe(newBoardData.title);
    });

    it("Should create multiple boards for the same user", async () => {
      const boardData1: InsertBoardParams = {
        title: "Test Board Created",
        userId: TEST_USER_ID,
      };
      const boardData2: InsertBoardParams = {
        title: "Test Board Created",
        userId: TEST_USER_ID,
      };

      const result1 = await Board.create(boardData1);
      const result2 = await Board.create(boardData2);

      expect(result1[0].id).not.toBe(result2[0].id);
      expect(result1[0].userId).toBe(result2[0].userId);
    });
  });

  describe("updateName", () => {
    let testBoardId: number;

    beforeEach(async () => {
      // Create a test board for updating
      const newBoard = await Board.create({
        title: "Test Board Created",
        userId: TEST_USER_ID,
      });
      testBoardId = newBoard[0].id;
    });

    afterEach(async () => {
      // Clean up the test board
      await db.delete(boards).where(eq(boards.id, testBoardId));
    });

    it("Should update the board name and return the new title", async () => {
      const newTitle = "Updated Board Title";
      const updateParams: UpdateBoardNameParams = {
        boardId: testBoardId,
        title: newTitle,
      };

      const result = await Board.updateName(updateParams);
      expect(result).toBe(newTitle);

      // Verify the change in the database
      const updatedBoard = await db
        .select()
        .from(boards)
        .where(eq(boards.id, testBoardId));
      expect(updatedBoard).toHaveLength(1);
      expect(updatedBoard[0].title).toBe(newTitle);
      expect(updatedBoard[0].userId).toBe(TEST_USER_ID); // Should remain unchanged
    });

    it("Should handle updating to the same title", async () => {
      const sameTitle = "Test Board Created";
      const updateParams: UpdateBoardNameParams = {
        boardId: testBoardId,
        title: sameTitle,
      };

      const result = await Board.updateName(updateParams);
      expect(result).toBe(sameTitle);

      // Verify the title remains the same
      const board = await db
        .select()
        .from(boards)
        .where(eq(boards.id, testBoardId));
      expect(board[0].title).toBe(sameTitle);
    });

    it("Should handle updating non-existent board gracefully", async () => {
      const updateParams: UpdateBoardNameParams = {
        boardId: NON_EXISTENT_BOARD_ID,
        title: "Non-existent Board",
      };

      // This should not throw an error, just update 0 rows
      const result = await Board.updateName(updateParams);
      expect(result).toBe("Non-existent Board");
    });
  });

  describe("delete", () => {
    let testBoardId: number;

    beforeEach(async () => {
      // Create a test board for deletion
      const newBoard = await Board.create({
        title: "Test Board Created",
        userId: TEST_USER_ID,
      });
      testBoardId = newBoard[0].id;
    });

    it("Should delete the board and return the board ID", async () => {
      const deleteParams: BoardIdParams = {
        boardId: testBoardId,
      };

      const result = await Board.delete(deleteParams);
      expect(result).toBe(testBoardId);

      // Verify the board was deleted
      const deletedBoard = await db
        .select()
        .from(boards)
        .where(eq(boards.id, testBoardId));
      expect(deletedBoard).toHaveLength(0);
    });

    it("Should handle deleting non-existent board gracefully", async () => {
      const deleteParams: BoardIdParams = {
        boardId: NON_EXISTENT_BOARD_ID,
      };

      // This should not throw an error, just delete 0 rows
      const result = await Board.delete(deleteParams);
      expect(result).toBe(NON_EXISTENT_BOARD_ID);
    });

    it("Should cascade delete associated tasks when board is deleted", async () => {
      // Create a separate test board with tasks for cascade testing
      const testBoard = await Board.create({
        title: "Test Board Created",
        userId: TEST_USER_ID,
      });
      const testBoardId = testBoard[0].id;

      // Create a task associated with this test board
      await db.insert(tasks).values({
        title: "Test Task for Cascade",
        status: "TODO",
        dueDate: new Date("2025-01-01"),
        hasDueTime: false,
        boardId: testBoardId,
      });

      const deleteParams: BoardIdParams = {
        boardId: testBoardId,
      };

      const result = await Board.delete(deleteParams);
      expect(result).toBe(testBoardId);

      // Verify the board was deleted
      const deletedBoard = await db
        .select()
        .from(boards)
        .where(eq(boards.id, testBoardId));
      expect(deletedBoard).toHaveLength(0);

      // Verify associated tasks were also deleted due to CASCADE
      const associatedTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.boardId, testBoardId));
      expect(associatedTasks).toHaveLength(0);

      // Note: Due to CASCADE DELETE in schema, associated tasks should also be deleted
      // This tests the database constraint rather than application logic
    });
  });

  describe("integration with seeded data", () => {
    it("Should work with existing seeded board", async () => {
      // First check if seeded board exists (it might have been deleted by other tests)
      const allBoards = await db.select().from(boards);

      if (allBoards.length === 0) {
        // If no boards exist, create one to test with
        const newBoard = await Board.create({
          title: "Project Board",
          userId: TEST_USER_ID,
        });
        const boardId = newBoard[0].id;

        // Test update operation
        const newTitle = "Updated Board";
        const result = await Board.updateName({
          boardId: boardId,
          title: newTitle,
        });
        expect(result).toBe(newTitle);

        // Verify the update worked
        const updatedBoard = await db
          .select()
          .from(boards)
          .where(eq(boards.id, boardId));
        expect(updatedBoard).toHaveLength(1);
        expect(updatedBoard[0].title).toBe(newTitle);
      } else {
        // Use existing board
        const existingBoard = allBoards[0];
        const originalTitle = existingBoard.title;

        // Test update operation
        const newTitle = "Updated Seeded Board";
        const result = await Board.updateName({
          boardId: existingBoard.id,
          title: newTitle,
        });
        expect(result).toBe(newTitle);

        // Verify the update worked
        const updatedBoard = await db
          .select()
          .from(boards)
          .where(eq(boards.id, existingBoard.id));
        expect(updatedBoard).toHaveLength(1);
        expect(updatedBoard[0].title).toBe(newTitle);

        // Restore original title
        await Board.updateName({
          boardId: existingBoard.id,
          title: originalTitle,
        });
      }
    });
  });
});

