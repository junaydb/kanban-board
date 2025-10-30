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

      if (toastId.current) {
        toast.dismiss();
        toast.success("Server connection re-established");
        toastId.current = null;
      }

      return true;
    },

    // never cache
    staleTime: 0,
    gcTime: 0,

    // retry and show a toast displaying number of retries
    retry: (failureCount) => {
      // if we fail 5 times, show an action toast to allow the user to manually trigger a refetch
      if (failureCount > 4) {
        toast.dismiss();
        toastId.current = toast("Could not connect to server", {
          duration: Infinity,
          action: {
            label: "Retry",
            onClick: () => {
              toast.dismiss();
              toastId.current = null;

              queryClient.invalidateQueries({
                queryKey: [HEALTH_CHECK_KEY],
                exact: true,
              });
            },
          },
        });
        return false;
      }

      // show a toast that displays the current retry attempt number
      if (!toastId.current) {
        toastId.current = toast.loading(
          `Retrying ${failureCount + 1} time(s)...`,
        );
      } else {
        toast.loading(`Retrying ${failureCount + 1} time(s)...`, {
          id: toastId.current,
        });
      }

      return true;
    },

    retryDelay: 2000,

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

export function useServerHealthCheck() {
  return useContext(HealthCheckContext);
}
