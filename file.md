# File Upload and Management

## Overview

T3Chat supports file attachments in conversations, allowing users to share various file types including images, documents, and more.

## How File Uploads Work

### Core Concepts

- **File Attachments**: Files can be attached to any message
- **Cloud Storage**: Files are stored securely in the cloud via Uploadcare
- **Preview Support**: Image files can be previewed directly in the chat

### Technical Implementation

The file upload system consists of several components:

1. **FileUploader Component**: Handles the file selection and upload process
2. **Uploadcare Integration**: Provides cloud storage and processing capabilities
3. **AttachmentChip Component**: Displays file attachments in the chat interface
4. **ImageViewer Component**: Provides enhanced viewing for image files

### Upload Process

1. User clicks the attachment button in the chat input
2. The Uploadcare widget opens for file selection
3. Selected files are uploaded to Uploadcare's cloud storage
4. Upon successful upload, file metadata is added to the message
5. A toast notification confirms the upload

### File Types and Previews

The system handles different file types appropriately:

- **Images**: Displayed as thumbnails with click-to-enlarge functionality
- **Documents**: Shown as file chips with name and type information
- **Other Files**: Represented as generic file attachments with download options

### Image Viewing Experience

When users click on an image attachment, an enhanced viewer opens:

```typescript
// ImageViewerDialog provides an optimized viewing experience
<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>      
  <DialogContent className="max-w-4xl dark:bg-zinc-800/80 bg-zinc-100 overflow-hidden p-4 border-2 ring-2 ring-white/50 rounded-xl">
    <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
      <Image 
        src={imageUrl} 
        alt={imageName} 
        className="object-contain max-h-[80vh] w-auto h-auto" 
        width={1200} 
        height={800} 
      />
    </div>
  </DialogContent>
</Dialog>
```

## Storage and Security

- Files are stored securely in Uploadcare's cloud infrastructure
- File URLs are stored in the message data structure
- Access to files follows the same permissions as the chat they belong to

## Implementation Details

### FileUploader Component

The FileUploader component uses dynamic loading to optimize performance:

```typescript
const FileUploaderRegular = dynamic(
  () => import('@uploadcare/react-uploader').then(mod => ({ default: mod.FileUploaderRegular })),
  { 
    ssr: false,
    loading: () => <FileUploaderSkeleton />
  }
);
```

### Handling Uploaded Files

When files are uploaded, they're processed and added to the message:

```typescript
const handleFileUploaded = (
  files: Array<{ name: string; url: string; type: string }>
) => {
  setAttachments((prev) => [...prev, ...files]);
};
```

### Attachment Display

Attachments are displayed in the chat using the AttachmentChip component, which provides appropriate visualization based on file type:

```typescript
export default function AttachmentChip({ name, url, type, onRemove }: AttachmentChipProps) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const isImage = type?.startsWith('image/');

  const handleChipClick = () => {
    if (isImage && url) {
      setIsImageViewerOpen(true);
    }
  };

  // Component rendering logic...
}
```