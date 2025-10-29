import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRef } from "react";
import { queryClient } from "@/trpc/trpc";

const HEALTH_CHECK_KEY = "health-check";

export function useHealthCheck() {
  const toastId = useRef<string | number | null>(null);

  return useQuery({
    queryKey: [HEALTH_CHECK_KEY],
    queryFn: async () => {
      const res = await fetch("/api/health", { method: "GET" });
      if (!res.ok) {
        throw new Error(`${res.status}`);
      }
      return true;
    },

    // never cache
    staleTime: 0,
    gcTime: 0,

    // retry and show a toast displaying number of retries
    retry: (failureCount) => {
      if (!toastId.current) {
        toastId.current = toast.loading("Retrying 1 time(s)...");
      } else {
        toast.loading(`Retrying ${failureCount} time(s)...`, {
          id: toastId.current,
        });
      }

      // show a new toast that has a button for manually reattempting the connection
      if (failureCount > 4) {
        toast.dismiss(toastId.current);
        toastId.current = toast("Could not connect to server", {
          action: {
            label: "Retry",
            onClick: () =>
              queryClient.resetQueries({
                queryKey: [HEALTH_CHECK_KEY],
                exact: true,
              }),
          },
        });
        return false;
      }

      return true;
    },

    // ping the server every 10 seconds if the query is not in an error state
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }
      return 10000;
    },
  });
}
