import { z } from "zod";
import { taskStatusEnum } from "../db/schema.js";

// Could possibly use drizzle-zod in the future, but this works for now.

const StatusEnum = z.enum(taskStatusEnum.enumValues);

const DateSchema = z
  .string()
  .datetime()
  .transform((str) => new Date(str));

export const IdSchema = z.coerce.number().int();

export const BoardIdSchema = z.object({
  boardId: IdSchema,
});

export const UserIdSchema = z.object({
  userId: z.string(),
});

export const TaskIdSchema = z.object({
  taskId: IdSchema,
});

const TaskPositionArraySchema = TaskIdSchema.merge(
  z.object({
    position: z.number(),
  }),
).array();

export const CreateTaskSchema = BoardIdSchema.merge(
  z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(10000).optional(),
    status: StatusEnum.default("TODO"),
    dueDate: DateSchema.refine(
      (date) => {
        return typeof date === "string" || date > new Date();
      },
      { message: "Due date must be in the future" },
    ).optional(),
    dueTime: DateSchema.optional(),
  }),
)
  .refine(
    (data) => {
      // Validate: dueTime requires dueDate
      if (data.dueTime && !data.dueDate) {
        return false;
      }
      return true;
    },
    {
      message: "dueTime can only be set when dueDate is also provided",
      path: ["dueTime"],
    },
  )
  .refine(
    (data) => {
      // Validate: dueTime must be in future if provided
      if (data.dueTime) {
        return typeof data.dueTime === "string" || data.dueTime > new Date();
      }
      return true;
    },
    {
      message: "Due time must be in the future",
      path: ["dueTime"],
    },
  );

export const UpdateStatusSchema = TaskIdSchema.merge(
  z.object({
    newStatus: StatusEnum,
  }),
);

export const GetAllTasksFromBoardSchema = BoardIdSchema.merge(
  z.object({
    sortBy: z.enum(["created", "dueDate", "position"]),
    sortOrder: z.enum(["ASC", "DESC"]),
  }),
);

export const UpdatePositionsSchema = BoardIdSchema.merge(
  z.object({
    todoPos: TaskPositionArraySchema,
    inProgressPos: TaskPositionArraySchema,
    donePos: TaskPositionArraySchema,
  }),
);

export const BoardTitleSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title cannot be blank" })
    .max(50, { message: "Title cannot be over 50 characters" }),
});
