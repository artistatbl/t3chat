import { memo, useState } from 'react';
import MarkdownRenderer from './MemoizedMarkdown';
import { cn } from '@/lib/utils';
import { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import MessageControls from './MessageControls';
import { UseChatHelpers } from '@ai-sdk/react';
import MessageEditor from './MessageEditor';
import MessageReasoning from './MessageReasoning';
import Image from 'next/image';
import ImageViewerDialog from './ImageViewerDialog';

function PureMessage({
  threadId,
  message,
  setMessages,
  reload,
  isStreaming,
  registerRef,
  stop,
}: {
  threadId: string;
  message: UIMessage;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
  reload: () => void;
  isStreaming: boolean;
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
  stop: UseChatHelpers['stop'];
}) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [selectedImage, setSelectedImage] = useState<{url: string; name: string} | null>(null);
  
  // Extract attachments from the message if they exist
  const attachments = (message as UIMessage & { attachments?: Array<{ name: string; url: string; type: string }> }).attachments || [];
  const hasAttachments = attachments.length > 0;

  const handleImageClick = (url: string, name: string) => {
    setSelectedImage({ url, name });
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <div
      role="article"
      className={cn(
        'flex flex-col',
        message.role === 'user' ? 'items-end' : 'items-start'
      )}
    >
      {message.parts.map((part, index) => {
        const { type } = part;
        const key = `message-${message.id}-part-${index}`;

        if (type === 'reasoning') {
          return (
            <MessageReasoning
              key={key}
              reasoning={part.reasoning}
              id={message.id}
            />
          );
        }

        if (type === 'text') {
          return message.role === 'user' ? (
            <div
              key={key}
              className="relative group px-4 py-3 rounded-xl bg-secondary border border-secondary-foreground/2 max-w-[80%]"
              ref={(el) => registerRef(message.id, el)}
            >
              {mode === 'edit' && (
                <MessageEditor
                  threadId={threadId}
                  message={message}
                  content={part.text}
                  setMessages={setMessages}
                  reload={reload}
                  setMode={setMode}
                  stop={stop}
                />
              )}
              {mode === 'view' && <p>{part.text}</p>}
              
              {/* Render attachments for user messages */}
              {mode === 'view' && hasAttachments && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((attachment, i) => (
                    <div key={`${message.id}-attachment-${i}`} className="overflow-hidden rounded-lg">
                      {attachment.type.startsWith('image/') ? (
                        <div 
                          className="relative w-[200px] h-[150px] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                          onClick={() => handleImageClick(attachment.url, attachment.name)}
                        >
                          <Image 
                            src={attachment.url} 
                            alt={attachment.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-secondary p-2 text-sm">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {attachment.name}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mode === 'view' && (
                <MessageControls
                  threadId={threadId}
                  content={part.text}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                  stop={stop}
                />
              )}
            </div>
          ) : (
            <div key={key} className="group flex flex-col gap-2 w-full">
              <MarkdownRenderer content={part.text} id={message.id} />
              
              {!isStreaming && (
                <MessageControls
                  threadId={threadId}
                  content={part.text}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                  stop={stop}
                />
              )}
            </div>
          );
        }
      })}

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <ImageViewerDialog
          isOpen={!!selectedImage}
          onClose={handleCloseImageViewer}
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
        />
      )}
    </div>
  );
}

const PreviewMessage = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  return true;
});

PreviewMessage.displayName = 'PreviewMessage';

export default PreviewMessage;