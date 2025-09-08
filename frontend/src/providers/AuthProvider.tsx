import { createContext, useContext, useState } from "react";
import { authClient } from "@/auth/auth-client";

type User = typeof authClient.signIn.social;
type SetUser = (user: User) => void;

const UserContext = createContext<User | null>(null);
const SetUserContext = createContext<SetUser | null>(() => {});

export function useAuth() {
  return useContext(UserContext);
}
export function useSetAuth() {
  return useContext(SetUserContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext value={user}>
      <SetUserContext value={setUser}>{children}</SetUserContext>
    </UserContext>
  );
}

export default AuthProvider;
