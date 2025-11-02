import {
  createContext,
  useContext,
  useSyncExternalStore,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";

const ClientNetworkStatusContext = createContext<boolean | null>(null);

function getSnapshot() {
  return navigator.onLine;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function ClientNetworkStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  const prevOnline = useRef<boolean | null>(null);

  // if we lose or regain connection, show a toast
  useEffect(() => {
    // store initial network state on first render
    if (prevOnline.current === null) {
      prevOnline.current = isOnline;
      return;
    }

    // connection lost
    if (!isOnline && prevOnline.current) {
      toast.dismiss();
      toast.error("Network connection lost");
    }
    // connection restored
    else if (isOnline && !prevOnline.current) {
      toast.dismiss();
      toast.success("Back online");
    }

    prevOnline.current = isOnline;
  }, [isOnline]);

  return (
    <ClientNetworkStatusContext value={isOnline}>
      {children}
    </ClientNetworkStatusContext>
  );
}

export function useClientNetworkStatus() {
  return useContext(ClientNetworkStatusContext);
}
