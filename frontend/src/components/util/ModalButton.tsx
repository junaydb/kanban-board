import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type VariantProps } from "class-variance-authority";

interface Props {
  text: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

function ModalButton({ text, children, variant = "default" }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalButton;
