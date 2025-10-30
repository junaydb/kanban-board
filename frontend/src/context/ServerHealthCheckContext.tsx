import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/trpc/trpc";

type HealthCheckContext = UseQueryResult<boolean, Error>;

const HEALTH_CHECK_KEY = "health-check";

const HealthCheckContext = createContext<HealthCheckContext | null>(null);

export function ServerHealthCheckProvider({
  children,
}: {
  children: ReactNode;
}) {
  const toastId = useRef<string | number | null>(null);

  const healthCheck = useQuery({
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

  // dismiss loading toasts when connection succeeds
  useEffect(() => {
    if (healthCheck.isSuccess && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [healthCheck.isSuccess]);

  return (
    <HealthCheckContext.Provider value={healthCheck}>
      {children}
    </HealthCheckContext.Provider>
  );
}

/**
 * Hook to access the server health check status from anywhere in the app.
 * Must be used within a ServerHealthCheckProvider.
 */
export function useServerHealthCheck() {
  return useContext(HealthCheckContext);
}
