import { useState, useCallback, useEffect, useRef } from 'react';
import Messages from '../messages/Messages';
import ChatInput from './ChatInput';
import ChatNavigator from './ChatNavigator';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { useThreadStore } from '@/app/stores/ThreadStore';
import { useConvexChat } from '@/app/hooks/useConvexChat';
import { client } from '@/lib/client';
import ThemeToggler from '../ui/ThemeToggler';
import { Button } from '../ui/button';
import { MessageSquareMore, ArrowDown } from 'lucide-react';
import { useChatNavigator } from '@/app/hooks/useChatNavigator';
import { toast } from 'sonner';

interface ChatProps {
  threadId: string;
  initialMessages: UIMessage[];
  onMessageSubmit?: () => void;
}

type ChatStatus = 'ready' | 'streaming' | 'submitted' | 'error';

export default function Chat({ threadId, initialMessages, onMessageSubmit }: ChatProps) {
  const { getKey } = useAPIKeyStore();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  const addThread = useThreadStore((state) => state.addThread);
  
  const { saveUserMessage, saveAssistantMessage, saveChatTitle, messages: convexMessages } = useConvexChat(threadId);

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | undefined>(undefined);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const {
    isNavigatorVisible,
    handleToggleNavigator,
    closeNavigator,
    registerRef,
    scrollToMessage,
  } = useChatNavigator();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!mainContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = mainContainerRef.current;
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollIndicator(isNotAtBottom);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Fixed initialization logic - only load once and prevent duplicates
  // In the useEffect where messages are loaded from Convex
  useEffect(() => {
    console.log('🔄 Chat initialization effect:', {
      threadId,
      convexMessages: convexMessages?.length || 0,
      initialMessages: initialMessages.length,
      isInitialized
    });
  
    // Only initialize once when convex messages are loaded
    if (convexMessages !== undefined && !isInitialized) {
      if (convexMessages.length > 0) {
        // Convert Convex messages to UI messages and sort by createdAt
        const uiMessages: UIMessage[] = convexMessages
          .sort((a, b) => a.createdAt - b.createdAt) // Sort by createdAt field
          .map(msg => ({
            parts: [{ type: 'text', text: msg.content }],
            id: msg.uuid,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            createdAt: new Date(msg.createdAt), // Use the createdAt from database
          }));
        console.log('✅ Loading messages from Convex:', uiMessages.length);
        setMessages(uiMessages);
      } else {
        // No messages in database, use initial messages
        console.log('📝 No messages in DB, using initial messages:', initialMessages.length);
        setMessages(initialMessages);
      }
      setIsInitialized(true);
    }
  }, [convexMessages, threadId, initialMessages, isInitialized]);

  const append = useCallback(async (message: UIMessage) => {
    if (status === 'streaming' || status === 'submitted') return;

    setMessages(prev => [...prev, message]);
    setStatus('submitted');
    setError(undefined);

    // Save user message to database
    await saveUserMessage(message);

    // Create thread name from first message
    if (messages.length === 0) {
      const threadName = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      addThread(threadId, threadName);
      // Save chat title to database
      await saveChatTitle(threadName);
      
      // Call onMessageSubmit if provided - this will redirect to the thread page
      if (onMessageSubmit) {
        onMessageSubmit();
      }
    }

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);
  
    try {
      const apiKey = getKey(modelConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }
  
      // Prepare messages for API - improved content extraction
      const apiMessages = [...messages, message].map(msg => {
        let content = '';
        
        // First try to get content from the content property
        if (msg.content && msg.content.trim()) {
          content = msg.content.trim();
        }
        // If content is empty, try to extract from parts
        else if (msg.parts && msg.parts.length > 0) {
          content = msg.parts
            .filter(part => part.type === 'text')
            .map(part => {
              // Type guard to ensure we're working with TextUIPart
              if (part.type === 'text' && 'text' in part) {
                return part.text?.trim() || '';
              }
              return '';
            })
            .filter(text => text.length > 0)
            .join('');
        }
        
        return {
          role: msg.role,
          content: content,
        };
      });
  
      // Filter out messages with empty content and non-conversation roles
      const validMessages = apiMessages.filter(msg => 
        msg.role !== 'data' && msg.content && msg.content.trim().length > 0
      ) as { role: 'system' | 'user' | 'assistant'; content: string; }[];
  
      setStatus('streaming');
  
      // Call the streaming endpoint
      const response = await client.chat.streamCompletion.$post({
        messages: validMessages,
        model: selectedModel,
      }, {
        headers: {
          [modelConfig.headerKey]: apiKey,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
  
      // Handle streaming response
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
  
      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream done, final content length:', accumulatedContent.length);
          break;
        }
        if (controller.signal.aborted) break;
  
        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 Raw chunk received:', chunk);
        
        const lines = chunk.split('\n');
        console.log('📄 Lines in chunk:', lines);
  
        for (const line of lines) {
          console.log('🔍 Processing line:', line);
          
          // Handle AI SDK streaming format
          if (line.startsWith('0:')) {
            // Text chunk format: 0:"content"
            try {
              const textContent = line.slice(2); // Remove '0:' prefix
              const parsedContent = JSON.parse(textContent); // Parse the quoted string
              
              accumulatedContent += parsedContent;
              console.log('✨ SUCCESS: Added text content:', parsedContent);
              console.log('📚 Total accumulated:', accumulatedContent);
              
              // Update the assistant message
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                const lastMessage = newMessages[lastIndex];
                
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Create completely new object to trigger React re-render
                  newMessages[lastIndex] = {
                    ...lastMessage,
                    content: accumulatedContent,
                    parts: [{ type: 'text', text: accumulatedContent }],
                  };
                  console.log('🔄 Updated assistant message:', newMessages[lastIndex]);
                } else {
                  console.warn('⚠️ Last message is not assistant:', lastMessage);
                }
                return newMessages;
              });
            } catch (error) {
              console.warn('⚠️ Failed to parse text chunk:', line, error);
            }
          } else if (line.startsWith('e:')) {
            // End/finish data: e:{"finishReason":"stop",...}
            console.log('🏁 Received finish signal:', line);
          } else if (line.startsWith('d:')) {
            // Done data: d:{"finishReason":"stop",...}
            console.log('✅ Received done signal:', line);
            break; // Exit the loop when done
          } else if (line.trim() === '') {
            // Empty line, skip
            continue;
          } else {
            console.log('⏭️ Unknown line format:', line);
          }
        }
      }
  
      // Ensure final message state is set after streaming completes
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        
        if (newMessages[lastIndex]?.role === 'assistant') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: accumulatedContent,
            parts: [{ type: 'text', text: accumulatedContent }],
          };
        }
        return newMessages;
      });

      // Save the completed assistant message to database
      const finalAssistantMessage: UIMessage = {
        ...assistantMessage,
        content: accumulatedContent,
        parts: [{ type: 'text', text: accumulatedContent }],
      };
      await saveAssistantMessage(finalAssistantMessage);
  
      setStatus('ready');
    } catch (err) {
      console.error('Chat error:', err);
      setError(err as Error);
      setStatus('error');
      toast.error('Failed to send message');
    } finally {
      setAbortController(null);
    }
  }, [messages, status, selectedModel, modelConfig, getKey, threadId, addThread, saveUserMessage, saveAssistantMessage, saveChatTitle, onMessageSubmit]);

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setStatus('ready');
    }
  }, [abortController]);

  const reload = useCallback(() => {
    console.log('🔄 Chat: Reload function called');
    console.log('📊 Chat: Current messages state:', {
      totalMessages: messages.length,
      messageIds: messages.map(m => ({ id: m.id, role: m.role })),
    });
    
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      console.log('👤 Chat: Found last user message:', {
        messageId: lastUserMessage?.id,
        content: lastUserMessage?.content?.substring(0, 50) + '...'
      });
      
      if (lastUserMessage) {
        // Remove the last assistant message if it exists
        const newMessages = messages.filter((_, index) => {
          const isLastAssistant = index === messages.length - 1 && messages[index]?.role === 'assistant';
          return !isLastAssistant;
        });
        
        console.log('🗑️ Chat: Filtered messages for reload:', {
          originalCount: messages.length,
          filteredCount: newMessages.length,
          removedLastAssistant: messages.length !== newMessages.length
        });
        
        setMessages(newMessages);
        console.log('📤 Chat: Calling append with last user message');
        append(lastUserMessage);
      }
    }
  }, [messages, append]);

  return (
    <div className="relative w-full">
      <div className="flex h-screen">
        <main
          ref={mainContainerRef}
          className="flex flex-col w-full max-w-3xl pt-10 pb-44 mx-auto transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar"
        >
          <Messages
            threadId={threadId}
            messages={messages}
            status={status}
            setMessages={setMessages}
            reload={reload}
            error={error}
            registerRef={registerRef}
            stop={stop}
          />
          <div ref={messagesEndRef} className="h-32" />
          <ChatInput
            threadId={threadId}
            input={input}
            status={status}
            append={append}
            setInput={setInput}
            stop={stop}
          />
        </main>
      </div>

      {showScrollIndicator && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-[180px] right-8 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-all"
          aria-label="Scroll to bottom"
        >
          <div className="flex items-center gap-2 px-3 py-1">
            <ArrowDown className="h-4 w-4" />
            <span className="text-sm">New messages</span>
          </div>
        </button>
      )}

      <div className="fixed top-4 right-4 flex items-center gap-4 z-20">
        <Button
          onClick={handleToggleNavigator}
          variant="outline"
          size="icon"
          aria-label={isNavigatorVisible ? 'Hide message navigator' : 'Show message navigator'}
        >
          <MessageSquareMore className="h-5 w-5" />
        </Button>
        <ThemeToggler />
      </div>

      <ChatNavigator
        threadId={threadId}
        scrollToMessage={scrollToMessage}
        isVisible={isNavigatorVisible}
        onClose={closeNavigator}
      />
    </div>
  );
}