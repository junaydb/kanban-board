import { Spinner } from "@/shadcn/ui/spinner";
import { Alert, AlertTitle } from "@/shadcn/ui/alert";
import { useState, useEffect } from "react";

type Props = {
  children?: React.ReactNode;
  delay?: number;
};

export function SpinnerBar({ children, delay = 300 }: Props) {
  const [showSpinner, setShowSpinner] = useState(false);

  // only show spinner after the specified delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showSpinner) {
    return null;
  }

  return (
    <Alert className="flex justify-center rounded-md">
      <Spinner />
      <AlertTitle>{children}</AlertTitle>
    </Alert>
  );
}
