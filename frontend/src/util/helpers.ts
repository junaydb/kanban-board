import type { TaskStatusEnum } from "@backend/util/types";

export function statusEnumToDisplay(status: TaskStatusEnum) {
  const statusMapper = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done",
  };

  return statusMapper[status];
}

export function getSetStatusOptions(status: TaskStatusEnum) {
  const statusArr: TaskStatusEnum[] = ["TODO", "IN_PROGRESS", "DONE"];
  return statusArr.filter((cur) => status !== cur);
}

export function combineDateAndTimeToISO(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function toLowerKebabCase(str = "") {
  return str.toLowerCase().replace(/\s/g, "-");
}
