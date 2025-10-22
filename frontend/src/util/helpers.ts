import type { Status } from "@/util/types";
import { useQuery } from "@tanstack/react-query";

export function statusEnumToDisplay(status: Status) {
  const statusMapper = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done",
  };

  return statusMapper[status];
}

export function getSetStatusOptions(status: Status) {
  const statusArr: Status[] = ["TODO", "IN_PROGRESS", "DONE"];
  return statusArr.filter((cur) => status !== cur);
}

export function combineDateAndTimeToISO(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function toLowerKebabCase(str: string) {
  return str.toLowerCase().replace(/\s/g, "-");
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health-check"],
    queryFn: async () => {
      const res = await fetch("/api/health", { method: "GET" });
      if (!res.ok) {
        throw new Error("Health check failed");
      }
      return true;
    },
    staleTime: 0,
    gcTime: 0,
  });
}
