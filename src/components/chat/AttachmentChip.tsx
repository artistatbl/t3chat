'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import ImageViewerDialog from '@/components/messages/ImageViewerDialog';

interface AttachmentChipProps {
  name: string;
  url?: string;
  type?: string;
  onRemove: () => void;
}

export default function AttachmentChip({ name, url, type, onRemove }: AttachmentChipProps) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const isImage = type?.startsWith('image/');

  const handleChipClick = () => {
    if (isImage && url) {
      setIsImageViewerOpen(true);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chip click
    onRemove();
  };

  return (
    <>
      <div 
        className={`flex flex-col border-2 ring-2 ring-transparent border-fuchsia-500 rounded-lg overflow-hidden max-w-[50px] transition-all duration-300 ${
          isImage && url 
            ? 'cursor-pointer hover:ring-fuchsia-400/50 hover:border-fuchsia-400 hover:shadow-lg hover:shadow-fuchsia-500/20 hover:scale-105 transform' 
            : ''
        }`}
        onClick={handleChipClick}
      >
        {isImage && url && (
          <div className="relative w-full h-[20px] group">
            <Image 
              src={url} 
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 px-4 py-1">
          <span className="truncate text-sm">{name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200" 
            onClick={handleRemoveClick}
          >
            <X size={12} className="text-red-600 hover:text-red-700" />
          </Button>
        </div>
      </div>
      
      {isImage && url && (
        <ImageViewerDialog
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          imageUrl={url}
          imageName={name}
        />
      )}
    </>
  );
}