import { Spinner } from "@/shadcn/ui/spinner";
import { Alert, AlertTitle } from "@/shadcn/ui/alert";

type Props = {
  children: React.ReactNode;
};

function SpinnerBar({ children }: Props) {
  return (
    <Alert className="flex justify-center rounded-md">
      <Spinner />
      <AlertTitle>{children}</AlertTitle>
    </Alert>
  );
}

export default SpinnerBar;
