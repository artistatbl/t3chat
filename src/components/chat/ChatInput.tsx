'use client';
import { ArrowUpIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAutoResizeTextarea from '@/app/hooks/useAutoResizeTextArea';
import { UseChatHelpers } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { getModelConfig } from '@/lib/models';
import APIKeyDialog from '@/components/global/APIKeyDialog';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { StopIcon } from '../ui/icons';
import { useMessageSummary } from '@/app/hooks/useMessageSummary';
import { ChatModelDropdown } from './ModelSelector';
import FileUploader from './FileUploader';
import AttachmentChip from './AttachmentChip';
import { generateAndSaveTitle } from '@/utils/titleGenerator'; // Add this import

interface ChatInputProps {
  threadId: string;
  input: UseChatHelpers['input'];
  status: UseChatHelpers['status'];
  setInput: UseChatHelpers['setInput'];
  append: (message: UIMessage) => Promise<void>;
  stop: UseChatHelpers['stop'];
  saveChatTitle: (title: string) => Promise<void>;
  isNewChat?: boolean; // Add this prop to detect new chats
}

interface StopButtonProps {
  stop: UseChatHelpers['stop'];
}

interface SendButtonProps {
  onSubmit: () => void;
  disabled: boolean;
}

const createUserMessage = (id: string, text: string): UIMessage => ({
  id,
  parts: [{ type: 'text', text }],
  role: 'user',
  content: text,
  createdAt: new Date(),
});

function PureChatInput({
  threadId,
  input,
  status,
  setInput,
  append,
  stop,
  saveChatTitle,
  isNewChat = false,
}: ChatInputProps) {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [pendingInput, setPendingInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string }>>([]);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });

  const router = useRouter();
  const id = threadId && threadId.length > 0 ? threadId : null;

  const isDisabled = useMemo(
    () => ((!input.trim() && attachments.length === 0) || status === 'streaming' || status === 'submitted'),
    [input, status, attachments.length]
  );

  const { complete } = useMessageSummary();

  const hasApiKeyForCurrentModel = useCallback(() => {
    const modelConfig = getModelConfig(selectedModel);
    const apiKey = getKey(modelConfig.provider);
    return !!apiKey;
  }, [getKey, selectedModel]);

  // Add this import at the top of the file
  
  // Then modify the handleSubmit function
  const handleSubmit = useCallback(async () => {
    const currentInput = textareaRef.current?.value || input;
  
    if (
      (!currentInput.trim() && attachments.length === 0) ||
      status === 'streaming' ||
      status === 'submitted'
    )
      return;
  
    if (!hasApiKeyForCurrentModel()) {
      setPendingInput(currentInput.trim());
      setShowAPIKeyDialog(true);
      return;
    }
  
    const messageId = uuidv4();
  
    // Send the message first
    const userMessage = createUserMessage(messageId, currentInput.trim());
    if (attachments.length > 0) {
      (userMessage as UIMessage & { attachments: Array<{ name: string; url: string; type: string }> }).attachments = attachments;
    }
    
    // Start title generation in parallel but don't await it
    if (isNewChat && currentInput.trim()) {
      console.log('%c 🚀 STARTING TITLE GENERATION FOR NEW CHAT', 'background: #FF9800; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      // Use Promise.resolve to run this in parallel without blocking
      Promise.resolve().then(async () => {
        try {
          const modelConfig = getModelConfig(selectedModel);
          const apiKey = getKey(modelConfig.provider);
          if (apiKey) {
            await generateAndSaveTitle(
              threadId,
              currentInput.trim(),
              apiKey,
              modelConfig,
              saveChatTitle,
              selectedModel
            );
            console.log('%c 🏁 TITLE GENERATION PROCESS COMPLETED', 'background: #9C27B0; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
          }
        } catch (error) {
          console.error('%c ❌ TITLE GENERATION FAILED: ' + error, 'background: #F44336; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
        }
      });
    }
    
    // Continue with message sending immediately
    append(userMessage);
    setInput('');
    setAttachments([]);
    adjustHeight(true);
  
    // Navigate to chat page for new chats
    if (!id) {
      router.push(`/chat/${threadId}`);
    }
  }, [
    input,
    status,
    setInput,
    adjustHeight,
    append,
    id,
    textareaRef,
    threadId,
    complete,
    router,
    hasApiKeyForCurrentModel,
    attachments,
    saveChatTitle,
    isNewChat,
    selectedModel,
  ]);

  const handleAPIKeySuccess = useCallback(async () => {
    if (!pendingInput.trim() && attachments.length === 0) return;
  
    const messageId = uuidv4();
  
    // Send the message first
    const userMessage = createUserMessage(messageId, pendingInput);
    if (attachments.length > 0) {
      (userMessage as UIMessage & { attachments: Array<{ name: string; url: string; type: string }> }).attachments = attachments;
    }
    
    append(userMessage);
    setInput('');
    setPendingInput('');
    setAttachments([]);
    adjustHeight(true);
    setShowAPIKeyDialog(false);

    // Navigate to chat page for new chats
    if (!id) {
      router.push(`/chat/${threadId}`);
    }
    
    // Generate title ONLY for new chats (first message)
    if (isNewChat && pendingInput.trim()) {
      console.log('🎯 ChatInput handleAPIKeySuccess: Starting title generation for new chat');
      setTimeout(async () => {
        try {
          console.log('📝 ChatInput handleAPIKeySuccess: Calling complete for title generation');
          // Fix: Use correct parameters for complete function
          const generatedTitle = await complete(pendingInput.trim(), {
            body: {
              threadId,
              isTitle: true,
            }
          });
          console.log('✅ ChatInput handleAPIKeySuccess: Generated title:', generatedTitle);
          if (generatedTitle) {
            console.log('💾 ChatInput handleAPIKeySuccess: Saving title to database');
            await saveChatTitle(generatedTitle);
            console.log('✅ ChatInput handleAPIKeySuccess: Title saved successfully');
          } else {
            console.warn('⚠️ ChatInput handleAPIKeySuccess: No title generated');
          }
        } catch (error) {
          console.error('❌ ChatInput handleAPIKeySuccess: Failed to generate or save title:', error);
        }
      }, 500); // Small delay to ensure message is processed
    }
  }, [pendingInput, id, router, threadId, complete, append, setInput, adjustHeight, attachments, saveChatTitle, isNewChat, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  };

  const handleFileUploaded = (files: Array<{ name: string; url: string; type: string }>) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fixed bottom-0 w-full  max-w-3xl rounded-lg bg-secondary dark:bg-secondary p-2 ring-4 ring-zinc-900/10 dark:ring-white/10 lg">
        <div className="bg-secondary rounded-xl p-2 pb-0 w-full">
          <div className="relative">
            <div className="flex flex-col">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 py-2">
                  {attachments.map((file, index) => (
                    <AttachmentChip 
                      key={index} 
                      name={file.name} 
                      url={file.url}
                      type={file.type}
                      onRemove={() => removeAttachment(index)} 
                    />
                  ))}
                </div>
              )}
              <div className="bg-secondary overflow-y-auto max-h-[300px]">
                <Textarea
                  id="chat-input"
                  value={input}
                  placeholder="Type your message here..."
                  className={cn(
                    'w-full px-4 py-3 border-none shadow-none dark:bg-transparent',
                    'placeholder:text-zinc-600 text-sm dark:placeholder:text-zinc-300 resize-none',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30',
                    'scrollbar-thumb-rounded-full',
                    'min-h-[72px]'
                  )}
                  ref={textareaRef}
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                  aria-label="Chat message input"
                  aria-describedby="chat-input-description"
                />
                <span id="chat-input-description" className="sr-only">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>

              <div className="h-14 flex items-center px-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ChatModelDropdown />
                    <FileUploader onFileUploaded={handleFileUploaded} />
                  </div>

                  {status === 'submitted' || status === 'streaming' ? (
                    <StopButton stop={stop} />
                  ) : (
                    <SendButton onSubmit={handleSubmit} disabled={isDisabled} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={(open) => {
          setShowAPIKeyDialog(open);
          if (!open) {
            setPendingInput('');
          }
        }}
        onSuccess={handleAPIKeySuccess}
      />
    </>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

function PureStopButton({ stop }: StopButtonProps) {
  return (
    <Button
    className="h-10 w-10 rounded-lg bg-fuchsia-950/70 hover:bg-fuchsia-900 transition-all duration-200"

      size="icon"
      onClick={stop}
      aria-label="Stop generating response"
    >
      <StopIcon size={20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

const PureSendButton = ({ onSubmit, disabled }: SendButtonProps) => {
  return (
    <Button
      onClick={onSubmit}
      className="h-10 w-10 rounded-lg bg-fuchsia-950/80 hover:bg-fuchsia-950 transition-all duration-200"
      size="icon"
      disabled={disabled}
      aria-label="Send message"
    >
      <ArrowUpIcon size={18} />
    </Button>
  );
};

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  return prevProps.disabled === nextProps.disabled;
});

export default ChatInput;