import SignInModal from "./SignInModal";
import SignOutButton from "./SignOutButton";
import DeleteAccountModal from "./DeleteAccountModal";
import { authClient } from "@/auth/auth-client";

function AuthModule() {
  const { data: session } = authClient.useSession();

  return (
    <div>
      {session ? (
        <>
          <SignOutButton />
          <DeleteAccountModal />
        </>
      ) : (
        <SignInModal />
      )}
    </div>
  );
}

export default AuthModule;
