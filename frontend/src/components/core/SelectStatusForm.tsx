import { useState } from "react";
import { useUpdateTaskStatus } from "@/util/hooks";
import { statusEnumToDisplay, getSetStatusOptions } from "@/util/helpers";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { RouterInput, Status } from "@/util/types";

type UpdateTaskStatusParams = RouterInput["tasks"]["updateStatus"];

interface Props {
  params: UpdateTaskStatusParams;
}

function SelectStatusForm({ params }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<Status | "">("");
  const [submittedData, setSubmittedData] =
    useState<UpdateTaskStatusParams | null>(null);

  const { mutate } = useUpdateTaskStatus();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus) {
      setSubmittedData(params);
      mutate(params);
    }
  };

  if (!submittedData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select new status</h3>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <RadioGroup
              value={selectedStatus}
              onValueChange={(value: Status) => setSelectedStatus(value)}
            >
              {getSetStatusOptions(params.newStatus).map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{statusEnumToDisplay(option)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button type="submit" disabled={!selectedStatus} className="w-full">
            Confirm
          </Button>
        </form>
      </div>
    );
  }
}

export default SelectStatusForm;
