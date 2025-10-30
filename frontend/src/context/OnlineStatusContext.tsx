import {
  createContext,
  useContext,
  useSyncExternalStore,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type OnlineStatusContext = boolean;

const OnlineStatusContext = createContext<OnlineStatusContext | null>(null);

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

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    if (!isOnline) {
      toastId.current = toast("No network connection detected");
    } else if (toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [isOnline]);

  return (
    <OnlineStatusContext.Provider value={isOnline}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}
