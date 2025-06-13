'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import '@uploadcare/react-uploader/core.css';
import { toast } from 'sonner';

// File uploader skeleton using the existing Skeleton component
const FileUploaderSkeleton = () => (
  <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed border-muted-foreground/25">
    <Skeleton className="w-5 h-5 rounded" />
  </div>
);

const FileUploaderRegular = dynamic(
  () => import('@uploadcare/react-uploader').then(mod => ({ default: mod.FileUploaderRegular })),
  { 
    ssr: false,
    loading: () => <FileUploaderSkeleton />
  }
);

interface FileUploaderProps {
  onFileUploaded: (files: Array<{ name: string; url: string; type: string }>) => void;
}

export default function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const uploaderRef = useRef<HTMLDivElement>(null);
  
  return (
    <>
      <div ref={uploaderRef}>
        <FileUploaderRegular 
          pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || ''}
          onChange={(event) => {
            const uploadedFiles = event.successEntries
              .map((file) => ({
                name: file.name || 'file',
                url: file.cdnUrl || '',
                type: file.mimeType || 'application/octet-stream'
              }));
            
            if (uploadedFiles.length > 0) {
              onFileUploaded(uploadedFiles);
              
              // Add toast notification
              if (uploadedFiles.length === 1) {
                toast.success(`File "${uploadedFiles[0]?.name ?? 'unknown'}" added to chat`);
              } else {
                toast.success(`${uploadedFiles.length} files added to chat`);
              }
            }
          }}
        />
      </div>
    </>
  );
}