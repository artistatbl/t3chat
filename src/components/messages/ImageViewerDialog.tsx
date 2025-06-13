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
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>{`Image: ${imageName}`}</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[60vh] flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={imageName}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}