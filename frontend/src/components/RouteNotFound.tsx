import { AlertCircle } from "lucide-react";

function RouteNotFound() {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grow rounded-md border-2 border-dashed flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground">Invalid route</p>
        </div>
      </div>
    </div>
  );
}

export default RouteNotFound;
