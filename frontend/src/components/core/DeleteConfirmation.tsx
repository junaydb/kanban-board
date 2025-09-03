import { useState } from "react";
import { useDeleteTask } from "@/util/hooks";
import { RouterInput } from "@/util/types";
import { Button } from "@/components/ui/button";

type MutationParams = RouterInput["tasks"]["delete"];

interface Props {
  params: MutationParams;
}

function DeleteTaskConfirmation({ params }: Props) {
  const [submittedData, setSubmittedData] = useState<MutationParams | null>(
    null,
  );

  const { mutate } = useDeleteTask();

  const onConfirm = () => {
    const deleteParams = { ...params };
    setSubmittedData(deleteParams);
    mutate(deleteParams);
  };

  if (!submittedData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Are you sure?</h3>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone
        </p>
        <div className="flex space-x-2">
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Confirm
          </Button>
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}

export default DeleteTaskConfirmation;
