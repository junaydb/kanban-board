import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { authClient } from "@/auth/auth-client";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

function DeleteAccountModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleDeleteAccount() {
    const deleted = await authClient.deleteUser();
    if (deleted.data?.success) {
      // Success toast 
      navigate({ to: "/boards" });
    }
    if (deleted.error) {
      // Error toast 
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            All your boards will be permanently deleted. This action is not
            undoable.
          </DialogDescription>
        </DialogHeader>
        <Button type="submit" className="flex" onClick={handleDeleteAccount}>
          Yes
        </Button>
        <Button type="submit" className="flex" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccountModal;
