'use client';

import { useRef } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';

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
            }
          }}
        />
      </div>
    </>
  );
}