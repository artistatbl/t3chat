import { useState } from "react";
import { AlertTriangle, XIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { useNavigate } from "react-router";

interface ChatDeleteProps {
  chatUuid: string;
  chatTitle?: string;
  userId: string;
  onDeleteSuccess?: () => void;
  redirectToHome?: boolean;
}

export default function ChatDelete({
  chatUuid,
  chatTitle,
  userId,
  onDeleteSuccess,
  redirectToHome = false,
}: ChatDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const deleteChat = useMutation(api.chats.deleteChat);
  // Remove router initialization

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setError(null);
  };

  const handleDelete = async () => {
    if (!userId) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteChat({ uuid: chatUuid, userId });
      setIsOpen(false);
      if (redirectToHome) {
        navigate("/"); // Client-side navigation, no hard refresh
        return;
      } else if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      setError("Failed to delete chat. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
       <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover/menu-item:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] transform scale-75 group-hover/menu-item:scale-100 p-1 h-6 w-6 hover:bg-red-100 hover:text-red-600"
        onClick={handleOpenDialog}
        title="Delete chat"
      >

        <XIcon className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Chat
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete “{chatTitle || "this chat"}”? This
              action cannot be undone and all messages will be permanently lost.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
