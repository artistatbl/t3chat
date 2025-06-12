import { UseChatHelpers } from '@ai-sdk/react';
import { useState } from 'react';
import { UIMessage } from 'ai';
import { Dispatch, SetStateAction } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { toast } from 'sonner';
import { client } from '@/lib/client';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';

export default function MessageEditor({
  threadId,
  message,
  content,
  setMessages,
  setMode,
  //reload,
  stop,
}: {
  threadId: string;
  message: UIMessage;
  content: string;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: () => void;
  stop: UseChatHelpers['stop'];
}) {
  const [draftContent, setDraftContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getKey = useAPIKeyStore((state) => state.getKey);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  
  // Add Convex mutation for updating messages
  const updateMessage = useMutation(api.messages.updateMessage);

  const handleSave = async () => {
    if (isSubmitting) return;
    
    console.log('💾 MessageEditor: Starting save process:', {
      originalMessageId: message.id,
      originalContent: message.content?.substring(0, 50) + '...',
      newContent: draftContent.substring(0, 50) + '...'
    });
    
    setIsSubmitting(true);

    try {
      // Update the message content in the local state immediately
      const updatedMessage = {
        ...message,
        content: draftContent,
        parts: [
          {
            type: 'text' as const,
            text: draftContent,
          },
        ],
      };

      console.log('🔄 MessageEditor: Created updated message:', {
        originalId: message.id,
        updatedId: updatedMessage.id,
        idsMatch: message.id === updatedMessage.id,
        updatedContent: updatedMessage.content?.substring(0, 50) + '...'
      });

      // Update messages state - replace the old message and remove any subsequent messages
      // In the handleSave function, ensure the updated message keeps its position
      setMessages((prevMessages) => {
        const index = prevMessages.findIndex((m) => m.id === message.id);
        if (index === -1) {
          console.error('❌ MessageEditor: Original message not found in state!');
          return prevMessages;
        }
        
        // Create updated message preserving the original createdAt
        const updatedMessage = {
          ...message,
          content: draftContent,
          parts: [
            {
              type: 'text' as const,
              text: draftContent,
            },
          ],
          // Keep the original createdAt to maintain chronological order
          createdAt: message.createdAt,
        };
        
        // Replace the message at the same index, remove subsequent messages
        const newMessages = [...prevMessages.slice(0, index), updatedMessage];
        
        console.log('✅ MessageEditor: Updated state with preserved order:', {
          originalIndex: index,
          newTotalMessages: newMessages.length,
          preservedCreatedAt: updatedMessage.createdAt
        });
        
        return newMessages;
      });

      console.log('🗄️ MessageEditor: Updating message in database:', {
        messageUuid: message.id,
        newContent: draftContent.substring(0, 50) + '...'
      });

      // Update the message in the Convex database
      await updateMessage({
        uuid: message.id,
        content: draftContent,
      });

      console.log('✅ MessageEditor: Database update completed');

      // Stop any ongoing streams
      stop();
      console.log('🛑 MessageEditor: Stopped ongoing streams');

      // Send the update to the server for AI completion
      const apiKey = getKey(modelConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      console.log('🤖 MessageEditor: Sending to AI completion:', {
        prompt: draftContent.substring(0, 50) + '...',
        model: selectedModel,
        threadId,
        messageId: message.id
      });

      // In the handleSave function, replace the non-streaming completion call:
      // Instead of:
      // const response = await client.completion.complete.$post(...)
      
      // Use the streaming endpoint:
      const response = await client.chat.streamCompletion.$post({
        messages: [
          {
            role: 'user',
            content: draftContent,
          },
        ],
        model: selectedModel,
      }, {
        headers: {
          [modelConfig.headerKey]: apiKey,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error: string }).error || 'Failed to update message');
      }
      
      // Handle streaming response (similar to Chat.tsx)
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }
      
      const decoder = new TextDecoder();
      const assistantMessage: UIMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: '' }],
        createdAt: new Date(),
      };
      
      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage]);
      
      // Stream the response
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
      
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
      
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
      
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  
                  // Update the assistant message
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: (msg.content || '') + content,
                            parts: [{ type: 'text', text: (msg.content || '') + content }],
                          }
                        : msg
                    )
                  );
                }
              } catch  {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('✅ MessageEditor: AI completion request successful');

      setMode('view');
      console.log('👁️ MessageEditor: Switched to view mode');

      // DON'T call reload() - this was causing the duplicates!
      // The state is already updated and the AI response will be streamed
      console.log('🚫 MessageEditor: Skipping reload to prevent duplicates');
      
    } catch (error) {
      console.error('❌ MessageEditor: Save failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save message');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 MessageEditor: Save process completed');
    }
  };

  return (
    <div>
      <Textarea
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
        disabled={isSubmitting}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button onClick={() => setMode('view')} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
