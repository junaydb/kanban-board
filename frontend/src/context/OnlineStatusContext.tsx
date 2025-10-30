import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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

  return (
    <OnlineStatusContext.Provider value={isOnline}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}
