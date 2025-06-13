import { memo } from 'react';
import PreviewMessage from './Message';
import { UIMessage } from 'ai';
import { UseChatHelpers } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import MessageLoading from './MessageLoading';
import Error from '../global/Error';

function PureMessages({
  threadId,
  messages,
  status,
  error,
  setMessages,
  reload,
  stop,
  registerRef,
}: {
  threadId: string;
  messages: UIMessage[];
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
  reload: () => void;
  status: UseChatHelpers['status'];
  error: UseChatHelpers['error'];
  stop: UseChatHelpers['stop'];
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
}) {
  // Check for duplicate IDs
  // const messageIds = messages.map(m => m.id);
  // const uniqueIds = new Set(messageIds);
  // const hasDuplicates = messageIds.length !== uniqueIds.size;
  
  // if (hasDuplicates) {
  //   const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
  //   console.error('🚨 Messages: DUPLICATE KEYS DETECTED!', {
  //     totalMessages: messages.length,
  //     uniqueMessages: uniqueIds.size,
  //     duplicateIds: duplicates,
  //     allMessageIds: messageIds,
  //     messagesWithDetails: messages.map(m => ({
  //       id: m.id,
  //       role: m.role,
  //       content: m.content?.substring(0, 30) + '...',
  //       createdAt: m.createdAt
  //     }))
  //   });
  // }

  // console.log('🖼️ Messages component rendering:', {
  //   messageCount: messages.length,
  //   status,
  //   hasDuplicates,
  //   messageIds: messageIds
  // });

  return (
    <section className="flex flex-col space-y-12">
      {messages.map((message, index) => {
        console.log(`🎭 Rendering message ${index}:`, {
          id: message.id,
          role: message.role,
          content: message.content?.substring(0, 50) + '...',
          partsCount: message.parts?.length
        });
        
        return (
          <PreviewMessage
            key={message.id}
            threadId={threadId}
            message={message}
            isStreaming={status === 'streaming' && messages.length - 1 === index}
            setMessages={setMessages}
            reload={reload}
            registerRef={registerRef}
            stop={stop}
          />
        );
      })}
      {(status === 'submitted' || (status === 'streaming' && !messages.find(m => m.role === 'assistant'))) && <MessageLoading />}
      {error && <Error message={error.message} />}
    </section>
  );
}

const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  return true;
});

Messages.displayName = 'Messages';

export default Messages;
