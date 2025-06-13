'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import '@uploadcare/react-uploader/core.css';

const FileUploaderRegular = dynamic(
  () => import('@uploadcare/react-uploader').then(mod => ({ default: mod.FileUploaderRegular })),
  { 
    ssr: false,
    loading: () => <div style={{ width: '40px', height: '40px' }}>Loading...</div>
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
            }
          }}
        />
      </div>
    </>
  );
}