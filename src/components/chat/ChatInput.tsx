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
import { ChatModelDropdown } from './ModelSelector'; // Added import

interface ChatInputProps {
  threadId: string;
  input: UseChatHelpers['input'];
  status: UseChatHelpers['status'];
  setInput: UseChatHelpers['setInput'];
  append: (message: UIMessage) => Promise<void>;
  stop: UseChatHelpers['stop'];
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
}: ChatInputProps) {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [pendingInput, setPendingInput] = useState('');

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });

  const router = useRouter();
  // For dynamic routes, we check if we're on a specific thread by checking if threadId is not a new UUID
  const id = threadId && threadId.length > 0 ? threadId : null;

  const isDisabled = useMemo(
    () => !input.trim() || status === 'streaming' || status === 'submitted',
    [input, status]
  );

  const { complete } = useMessageSummary();

  const hasApiKeyForCurrentModel = useCallback(() => {
    const modelConfig = getModelConfig(selectedModel);
    const apiKey = getKey(modelConfig.provider);
    return !!apiKey;
  }, [getKey, selectedModel]);

  const handleSubmit = useCallback(async () => {
    const currentInput = textareaRef.current?.value || input;

    if (
      !currentInput.trim() ||
      status === 'streaming' ||
      status === 'submitted'
    )
      return;

    // Check if user has API key for the selected model before proceeding
    if (!hasApiKeyForCurrentModel()) {
      // Preserve the input before showing the dialog
      setPendingInput(currentInput.trim());
      setShowAPIKeyDialog(true);
      return;
    }

    const messageId = uuidv4();

    if (!id) {
      router.push(`/chat/${threadId}`);
      complete(currentInput.trim(), {
        body: { threadId, messageId, isTitle: true },
      });
    } else {
      complete(currentInput.trim(), { body: { messageId, threadId } });
    }

    const userMessage = createUserMessage(messageId, currentInput.trim());
    append(userMessage);
    setInput('');
    adjustHeight(true);
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
  ]);

  const handleAPIKeySuccess = useCallback(() => {
    // Use the preserved input instead of current input
    if (!pendingInput.trim()) return;

    const messageId = uuidv4();

    if (!id) {
      router.push(`/chat/${threadId}`);
      complete(pendingInput, {
        body: { threadId, messageId, isTitle: true },
      });
    } else {
      complete(pendingInput, { body: { messageId, threadId } });
    }

    const userMessage = createUserMessage(messageId, pendingInput);
    append(userMessage);
    setInput('');
    setPendingInput(''); // Clear the pending input
    adjustHeight(true);
    setShowAPIKeyDialog(false);
  }, [pendingInput, id, router, threadId, complete, append, setInput, adjustHeight]);

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

  return (
    <>
      <div className="fixed bottom-0 w-full ring-1 ring-transparent rounded-xl max-w-3xl">
        <div className="bg-secondary rounded-t-[20px]  p-2 pb-0 w-full">
          <div className="relative">
            <div className="flex flex-col">
              <div className="bg-secondary overflow-y-auto max-h-[300px]">
                <Textarea
                  id="chat-input"
                  value={input}
                  placeholder="What can I do for you?"
                  className={cn(
                    'w-full px-4 py-3 border-none shadow-none dark:bg-transparent',
                    'placeholder:text-muted-foreground resize-none',
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
                  <ChatModelDropdown />

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
          // Clear pending input if dialog is closed without success
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

// Removed PureChatModelDropdown and ChatModelDropdown components from here

function PureStopButton({ stop }: StopButtonProps) {
  return (
    <Button
      variant="outline"
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
      variant="default"
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