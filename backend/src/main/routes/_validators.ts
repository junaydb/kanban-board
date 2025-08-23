import { z } from "zod";
import { taskStatusEnum } from "../db/schema.js";

// Could possibly use drizzle-zod in the future, but this works for now.

const StatusEnum = z.enum(taskStatusEnum.enumValues);

const DateSchema = z
  .string()
  .datetime()
  .transform((str) => new Date(str));

export const IdSchema = z.coerce.number().int();

export const UserIdSchema = z.object({
  userId: z.string(),
});

export const TaskIdSchema = z.object({
  taskId: IdSchema,
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(10000).optional(),
  status: StatusEnum.default("TODO"),
  dueDate: DateSchema.refine(
    (date) => {
      return typeof date === "string" || date > new Date();
    },
    { message: "Due date must be in the future" },
  ),
  hasDueTime: z.boolean().default(false),
  boardId: IdSchema,
});

export const UpdateStatusSchema = z.object({
  taskId: IdSchema,
  newStatus: StatusEnum,
});

export const ByCreatedCursorSchema = z.object({
  prevId: IdSchema,
  prevCreatedAt: DateSchema,
});

export const ByDueDateCursorSchema = z.object({
  prevId: IdSchema,
  prevDueDate: DateSchema,
});

export const PageQuerySchema = z.object({
  status: StatusEnum,
  sortBy: z.enum(["created", "dueDate"]).default("created"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  pageSize: z.coerce.number().int(),
  cursor: z.string().base64().optional(),
  boardId: IdSchema,
});

export const BoardIdSchema = z.object({
  boardId: IdSchema,
});

export const BoardTitleSchema = z.object({
  title: z.string().min(1).max(50),
});
