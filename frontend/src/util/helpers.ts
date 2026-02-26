import type { TaskStatusEnum } from "@backend/util/types";

export function getSetStatusOptions(status: TaskStatusEnum) {
  const statusArr: TaskStatusEnum[] = ["TODO", "IN_PROGRESS", "DONE"];
  return statusArr.filter((cur) => status !== cur);
}

export function toLowerKebabCase(str = "") {
  return str.toLowerCase().replace(/\s/g, "-");
}

export function getStatusProps(status: TaskStatusEnum) {
  const statusMapper = {
    TODO: {
      text: "To-do",
      colour: "#fff",
    },
    IN_PROGRESS: {
      text: "In progress",
      colour: "#fff",
    },
    DONE: {
      text: "Done",
      colour: "#fff",
    },
  };

  return statusMapper[status];
}
