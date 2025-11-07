import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/trpc/trpc";

const HEALTH_CHECK_KEY = "health-check";

const ServerNetworkStatusContext = createContext<boolean | null>(null);

export function ServerNetworkStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const toastId = useRef<string | number | null>(null);
  const prevServerStatus = useRef<boolean | null>(null);

  const healthCheck = useQuery({
    queryKey: [HEALTH_CHECK_KEY],
    queryFn: async () => {
      const res = await fetch("/api/health", { method: "GET" });

      if (!res.ok) {
        // show an error toast if we were in a success state
        if (prevServerStatus.current === true) {
          toast.dismiss();
          toast.error("Lost connection to server");
        }
        prevServerStatus.current = false;
        throw new Error(`${res.status}`);
      }

      // show an success toast if we were in an error state
      if (prevServerStatus.current === false) {
        toast.dismiss();
        toast.success("Server connection re-established");
      }
      prevServerStatus.current = true;

      return true;
    },

    // never cache
    staleTime: 0,
    gcTime: 0,

    // retry and show a toast displaying number of retries
    retry: (failureCount) => {
      // if we failed 5 times, show an action toast to allow the user to manually trigger a refetch
      if (failureCount > 4) {
        toast.dismiss();
        toastId.current = toast.error("Could not connect to server", {
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
      const retryingText = `Retrying ${failureCount + 1} time(s)...`;
      if (!toastId.current) {
        toastId.current = toast.loading(retryingText);
      } else {
        toast.loading(retryingText, { id: toastId.current });
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

  return (
    <ServerNetworkStatusContext value={healthCheck.isSuccess}>
      {children}
    </ServerNetworkStatusContext>
  );
}

export function useServerNetworkStatus() {
  return useContext(ServerNetworkStatusContext);
}
