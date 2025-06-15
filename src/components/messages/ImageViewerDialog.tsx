import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

export default function ImageViewerDialog({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: ImageViewerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>      
      <DialogContent className="max-w-4xl dark:bg-zinc-800/80 bg-zinc-100 overflow-hidden p-4 border-2  ring-2 ring-white/50 rounded-xl">
        <VisuallyHidden>
          <DialogTitle>{`Image: ${imageName}`}</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[60vh] flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={imageName}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}