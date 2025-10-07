import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";

type Props = {
  banner: "LOGGED_OUT" | "NEW_USER";
};

function Banner({ banner }: Props) {
  switch (banner) {
    case "LOGGED_OUT":
      return (
        <Alert variant="warning">
          <AlertCircleIcon />
          <AlertTitle>Using local storage</AlertTitle>
          <AlertDescription>
            Log in to store your boards remotely to access them from anywhere.
          </AlertDescription>
        </Alert>
      );
    case "NEW_USER":
      return (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertTitle>Welcome!</AlertTitle>
          <AlertDescription>
            You can now access your boards from anywhere.
          </AlertDescription>
        </Alert>
      );
  }
}

export default Banner;
