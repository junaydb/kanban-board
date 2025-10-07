import { Button } from "./ui/button";
import { authClient } from "@/auth/auth-client";
import { useNavigate } from "@tanstack/react-router";

function SignOutButton() {
  const navigate = useNavigate();

  async function handleSignOut() {
    const result = await authClient.signOut();
    if (result.data?.success) {
      // Success toast 
      navigate({ to: ".", replace: true });
    }
    if (result.error) {
      // Error toast 
    }
  }

  return <Button onClick={handleSignOut}>Sign out</Button>;
}

export default SignOutButton;
