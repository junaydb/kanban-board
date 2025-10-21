import { Alert, AlertTitle } from "@/shadcn/ui/alert";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";

type Props = {
  banner:
    | "LOGGED_OUT"
    | "NEW_USER"
    | "ACCOUNT_REMOVED"
    | "BOARD_FETCH_ERROR"
    | "AUTHORISATION_ERROR";
};

function Banner({ banner }: Props) {
  switch (banner) {
    case "LOGGED_OUT":
      return (
        <Alert className="flex justify-center rounded-md" variant="warning">
          <AlertCircleIcon />
          <AlertTitle>
            Using local storage. Log in to store your boards remotely and access
            them from anywhere.
          </AlertTitle>
        </Alert>
      );
    case "NEW_USER":
      return (
        <Alert className="flex justify-center rounded-md" variant="success">
          <CheckCircle2 />
          <AlertTitle>
            Welcome! You can now access your boards from anywhere.
          </AlertTitle>
        </Alert>
      );
    case "ACCOUNT_REMOVED":
      return (
        <Alert className="flex justify-center rounded-md" variant="success">
          <CheckCircle2 />
          <AlertTitle>Your account was successfully removed.</AlertTitle>
        </Alert>
      );
    case "BOARD_FETCH_ERROR":
      return (
        <Alert className="flex justify-center rounded-md" variant="error">
          <AlertCircleIcon />
          <AlertTitle>Unable to fetch boards</AlertTitle>
        </Alert>
      );
    case "AUTHORISATION_ERROR":
      return (
        <Alert className="flex justify-center rounded-md" variant="error">
          <AlertCircleIcon />
          <AlertTitle>Authorisation error</AlertTitle>
        </Alert>
      );
  }
}

export default Banner;
