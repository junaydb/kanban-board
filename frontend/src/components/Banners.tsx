import { Alert, AlertTitle } from "@/shadcn/ui/alert";
import { AlertCircleIcon, CheckCircle2, WifiOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";

type Props = {
  banner:
    | "LOGGED_OUT"
    | "NEW_USER"
    | "CLIENT_OFFLINE"
    | "SERVER_OFFLINE"
    | "FETCH_ERROR";
};

export function Banner({ banner }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const dismissButton = (
    <Badge
      asChild
      variant="outline"
      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDismissed(true)}
        className="h-auto py-1 px-2 flex items-center justify-center"
      >
        Dismiss
      </Button>
    </Badge>
  );

  switch (banner) {
    case "LOGGED_OUT":
      return (
        <Alert className="flex justify-center rounded-md" variant="warning">
          <AlertCircleIcon />
          <AlertTitle>
            Using local storage. Log in to store your boards remotely and access
            them from anywhere.
          </AlertTitle>
          {dismissButton}
        </Alert>
      );
    case "NEW_USER":
      return (
        <Alert className="flex justify-center rounded-md" variant="success">
          <CheckCircle2 />
          <AlertTitle>
            Welcome! You can now access your boards from anywhere.
          </AlertTitle>
          {dismissButton}
        </Alert>
      );
    case "CLIENT_OFFLINE":
      return (
        <Alert className="flex justify-center rounded-md" variant="error">
          <WifiOff />
          <AlertTitle>
            No network connection detected. The application will operate in
            offline mode.
          </AlertTitle>
          {dismissButton}
        </Alert>
      );
    case "SERVER_OFFLINE":
      return (
        <Alert className="flex justify-center rounded-md" variant="error">
          <WifiOff />
          <AlertTitle>
            Our servers seem to be down. The application will operate in offline
            mode.
          </AlertTitle>
          {dismissButton}
        </Alert>
      );
    case "FETCH_ERROR":
      return (
        <Alert className="flex justify-center rounded-md" variant="error">
          <AlertCircleIcon />
          <AlertTitle>Failed to fetch boards</AlertTitle>
        </Alert>
      );
  }
}
