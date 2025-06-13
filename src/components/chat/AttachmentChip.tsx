'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AttachmentChipProps {
  name: string;
  url?: string;
  type?: string;
  onRemove: () => void;
}

export default function AttachmentChip({ name, url, type, onRemove }: AttachmentChipProps) {
  const isImage = type?.startsWith('image/');

  return (
    <div className="flex flex-col bg-secondary rounded-lg overflow-hidden max-w-[200px]">
      {isImage && url && (
        <div className="relative w-full h-[100px]">
          <Image 
            src={url} 
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-1">
        <span className="truncate text-sm">{name}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 rounded-full" 
          onClick={onRemove}
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );
}