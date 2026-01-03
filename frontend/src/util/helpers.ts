import type { TaskStatusEnum } from "@backend/util/types";

export function getSetStatusOptions(status: TaskStatusEnum) {
  const statusArr: TaskStatusEnum[] = ["TODO", "IN_PROGRESS", "DONE"];
  return statusArr.filter((cur) => status !== cur);
}

export function toLowerKebabCase(str = "") {
  return str.toLowerCase().replace(/\s/g, "-");
}
