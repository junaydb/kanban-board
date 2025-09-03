import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  validateTitle,
  validateDescription,
  validateDueDate,
} from "@/util/validators";
import { useCreateTask } from "@/util/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RouterInput } from "@/util/types";

type Inputs = RouterInput["tasks"]["create"] & {
  dueTime: Date;
};

// Round the time to the nearest next half hour
function getRoundedTime() {
  const date = new Date();
  const mins = date.getMinutes();
  const remainder = mins % 30;
  const addMins = remainder === 0 ? 30 : 30 - remainder;
  date.setMinutes(mins + addMins);
  return date;
}

function formatDateToISOString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function CreateTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<Inputs | null>(null);

  const now = getRoundedTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    reValidateMode: "onSubmit",
    defaultValues: {
      dueDate: formatDateToISOString(today),
      dueTime: now,
      hasDueTime: false,
    },
  });

  const { mutate } = useCreateTask();

  const hasDueTime = watch("hasDueTime");

  const onSubmit: SubmitHandler<Inputs> = (params) => {
    let finalDateTime: Date;

    if (params.hasDueTime) {
      finalDateTime = new Date(params.dueTime);
    } else {
      // Set to end of day (23:59:59) if no specific time is chosen
      finalDateTime = new Date(params.dueDate + "T23:59:59");
    }

    setSubmittedData(params);
    mutate({
      title: params.title,
      description: params.description,
      dueDate: finalDateTime.toISOString(),
      // Hardcode this for now
      boardId: 1,
    });
  };

  const handleAddAnother = () => {
    setSubmittedData(null);
    reset({
      dueDate: formatDateToISOString(today),
      dueTime: now,
      hasDueTime: false,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSubmittedData(null);
      reset({
        dueDate: formatDateToISOString(today),
        dueTime: now,
        hasDueTime: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>

        {!submittedData ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
              <Input
                id="title"
                {...register("title", { validate: validateTitle })}
                className={errors.title ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <p className="text-sm text-muted-foreground">(Optional)</p>
              <Textarea
                id="description"
                {...register("description", { validate: validateDescription })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              {errors.dueDate && (
                <p className="text-sm text-red-600">{errors.dueDate.message}</p>
              )}
              <Controller
                name="dueDate"
                control={control}
                rules={{ validate: validateDueDate }}
                render={({ field }) => (
                  <DatePicker
                    id="dueDate"
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? formatDateToISOString(date) : "")
                    }
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                    className={`w-full px-3 py-2 border rounded-md ${errors.dueDate ? "border-red-500" : "border-gray-300"}`}
                    placeholderText="Select due date"
                  />
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="hasDueTime"
                type="checkbox"
                {...register("hasDueTime")}
                className="rounded"
              />
              <Label htmlFor="hasDueTime">Include due time</Label>
            </div>

            {hasDueTime && (
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due time</Label>
                {errors.dueTime && (
                  <p className="text-sm text-red-600">
                    {errors.dueTime.message}
                  </p>
                )}
                <Controller
                  name="dueTime"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="dueTime"
                      selected={field.value ? new Date(field.value) : null}
                      onChange={field.onChange}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className={`w-full px-3 py-2 border rounded-md ${errors.dueTime ? "border-red-500" : "border-gray-300"}`}
                      placeholderText="Select due time"
                      minTime={new Date(new Date().setHours(0, 0, 0, 0))}
                      maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                    />
                  )}
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xs">
              <h3 className="text-lg font-semibold text-green-800">
                Task created
              </h3>
            </div>
            <Button onClick={handleAddAnother} className="w-full">
              Add Another Task
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskModal;
