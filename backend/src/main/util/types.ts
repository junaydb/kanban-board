import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tasks, boards, taskPositions } from "../db/schema.js";
import {
  BoardIdSchema,
  TaskIdSchema,
  UpdateStatusSchema,
  UpdatePositionsSchema,
  BoardTitleSchema,
  UserIdSchema,
  GetAllTasksFromBoardSchema,
} from "../routes/_validators.js";

/* Types derived from drizzle schema */
export type TTask = InferSelectModel<typeof tasks>;
export type CreateTaskParams = InferInsertModel<typeof tasks>;
export type TaskStatusEnum = TTask["status"];
export type InsertBoardParams = InferInsertModel<typeof boards>;
export type TTaskPositions = InferSelectModel<typeof taskPositions>;

/* Types derived from Zod schemas */
export type GetAllFromBoardParams = z.infer<typeof GetAllTasksFromBoardSchema>;
export type UpdateStatusParams = z.infer<typeof UpdateStatusSchema>;
export type TaskIdParams = z.infer<typeof TaskIdSchema>;
export type BoardIdParams = z.infer<typeof BoardIdSchema>;
export type UserIdParams = z.infer<typeof UserIdSchema>;
export type UpdateBoardNameParams = z.infer<
  typeof BoardIdSchema & typeof BoardTitleSchema
>;
export type VerifyBoardOwnershipParams = z.infer<
  typeof UserIdSchema & typeof BoardIdSchema
>;
export type TaskSearchParams = z.infer<typeof BoardIdSchema> & {
  query: string;
};

export type UpdatePositionsParams = z.infer<typeof UpdatePositionsSchema>;
