import { useState, useCallback, useEffect, useRef } from "react";
import Messages from "../messages/Messages";
import ChatInput from "./ChatInput";
import { UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { useAPIKeyStore } from "@/app/stores/APIKeyStore";
import { useModelStore } from "@/app/stores/ModelStore";
import { useThreadStore } from "@/app/stores/ThreadStore";
import { useConvexChat } from "@/hooks/useConvexChat";
import { useSyncTabs } from "@/hooks/useSyncTabs";
import { client } from "@/lib/client";
import ThemeToggler from "../ui/ThemeToggler";
import { Button } from "../ui/button";
import { ArrowDown } from "lucide-react";
import { useChatNavigator } from "@/hooks/useChatNavigator";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatVisibilityToggle from "./ChatVisibilityToggle";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import BranchNavigator from "./BranchNavigator";

interface ChatProps {
  threadId: string;
  initialMessages: UIMessage[];
  onMessageSubmit?: () => void;
}

// Extending the UIMessage interface from 'ai' package to include our custom properties

type ChatStatus = "ready" | "streaming" | "submitted" | "error";

export default function Chat({
  threadId,
  initialMessages,
  onMessageSubmit,
}: ChatProps) {
  const { user } = useUser();
  const router = useRouter();

  // Add this query to get current chat data
  const currentChat = useQuery(
    api.chats.getChatByUuid,
    threadId ? { uuid: threadId } : "skip"
  );

  // Add the createBranch mutation
  const createBranch = useMutation(api.chats.createBranch);

  const { getKey } = useAPIKeyStore();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  const addThread = useThreadStore((state) => state.addThread);

  const {
    saveUserMessage,
    saveAssistantMessage,
    saveChatTitle,
    messages: convexMessages,
  } = useConvexChat(threadId);
  
  // Initialize tab synchronization
  const {
    broadcastNewMessage,
    subscribeToEvents
  } = useSyncTabs(threadId);

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<Error | undefined>(undefined);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const lastBroadcastTime = useRef<number | null>(null);

  const { registerRef } = useChatNavigator();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);
  
  // Listen for events from other tabs
  useEffect(() => {
    if (!threadId) return;
    
    // Subscribe to events from other tabs
    const unsubscribe = subscribeToEvents((event) => {
      switch (event.type) {
        case 'NEW_MESSAGE':
          // Process the incoming message
          const newMessage = event.data as UIMessage & { isFinalMessage?: boolean };
          
          setMessages((prev) => {
            // Check if message already exists
            const existingMessageIndex = prev.findIndex(msg => msg.id === newMessage.id);
            
            if (existingMessageIndex >= 0) {
              // If this is the final message or the existing message is not final,
              // update it to ensure we have the complete content
              if (newMessage.isFinalMessage || !(prev[existingMessageIndex] as UIMessage & { isFinalMessage?: boolean }).isFinalMessage) {
                const updatedMessages = [...prev];
                updatedMessages[existingMessageIndex] = newMessage;
                return updatedMessages;
              }
              // If the existing message is already marked as final, don't update it
              return prev;
            }
            
            // If message doesn't exist, add it
            return [...prev, newMessage];
          });
          break;
          
        case 'TYPING':
          // Could implement typing indicator here
          break;
          
        case 'TITLE_CHANGE':
          // Title changes are handled by Convex automatically
          break;
      }
    });
    
    return unsubscribe;
  }, [threadId, subscribeToEvents]);

  // Add the handleBranch function
  const handleBranch = useCallback(
    async (messageId: string) => {
      if (!user) {
        toast.error("Please sign in to create branches");
        return;
      }

      try {
        const newChatUuid = uuidv4();
        await createBranch({
          parentChatUuid: threadId,
          branchFromMessageId: messageId,
          userId: user.id,
          newChatUuid: newChatUuid, // Fixed: was newChatId
          title: currentChat?.title || "Chat", // Remove (Branch) suffix
        });

        toast.success("Branch created successfully!");
        router.push(`/chat/${newChatUuid}`);
      } catch (error) {
        console.error("Failed to create branch:", error);
        toast.error("Failed to create branch");
      }
    },
    [threadId, user, currentChat?.title, createBranch, router]
  );

  // Fixed initialization logic - only load once and prevent duplicates
  // In the useEffect where messages are loaded from Convex
  useEffect(() => {
    // console.log("🔄 Chat initialization effect:", {
    //   threadId,
    //   convexMessages: convexMessages?.length || 0,
    //   initialMessages: initialMessages.length,
    //   isInitialized,
    // });

    // Only initialize once when convex messages are loaded
    if (convexMessages !== undefined && !isInitialized) {
      if (convexMessages.length > 0) {
        // Convert Convex messages to UI messages and sort by createdAt
        const uiMessages: UIMessage[] = convexMessages
          .sort((a, b) => a.createdAt - b.createdAt) // Sort by createdAt field
          .map((msg) => {
            const message: UIMessage = {
              parts: [{ type: "text", text: msg.content }],
              id: msg.uuid,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              createdAt: new Date(msg.createdAt), // Use the createdAt from database
            };

            // Add attachments if present
            if (msg.attachments && msg.attachments.length > 0) {
              (
                message as UIMessage & {
                  attachments: Array<{
                    name: string;
                    url: string;
                    type: string;
                  }>;
                }
              ).attachments = msg.attachments;
            }

            return message;
          });
        // console.log("✅ Loading messages from Convex:", uiMessages.length);
        setMessages(uiMessages);
      } else {
        // No messages in database, use initial messages
        // console.log(
        //   "📝 No messages in DB, using initial messages:",
        //   initialMessages.length
        // );
        setMessages(initialMessages);
      }
      setIsInitialized(true);
    }
  }, [convexMessages, threadId, initialMessages, isInitialized]);

  const append = useCallback(
    async (message: UIMessage) => {
      if (status === "streaming" || status === "submitted") return;

      setMessages((prev) => [...prev, message]);
      setStatus("submitted");
      setError(undefined);

      // Save user message to database
      await saveUserMessage(message);
      
      // Broadcast the message to other tabs
      broadcastNewMessage(message);

      // For new chats, we'll let the AI generate the title via ChatInput
      // No need to create a truncated title here anymore
      if (messages.length === 0) {
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
          throw new Error("API key not found");
        } // Prepare messages for API - improved content extraction
        // Prepare messages for API - improved content extraction with multimodal support
        const apiMessages = [...messages, message].map((msg) => {
          const attachments = (
            msg as {
              attachments?: Array<{ name: string; url: string; type: string }>;
            }
          ).attachments;

          // Check if we need to use multimodal format
          if (attachments && attachments.length > 0) {
            // Create multimodal content array
            const content = [];

            // Add text content if it exists
            if (msg.content && msg.content.trim()) {
              content.push({
                type: "text",
                text: msg.content.trim(),
              });
            } else if (msg.parts && msg.parts.length > 0) {
              const textContent = msg.parts
                .filter((part) => part.type === "text")
                .map((part) => {
                  if (part.type === "text" && "text" in part) {
                    return part.text?.trim() || "";
                  }
                  return "";
                })
                .filter((text) => text.length > 0)
                .join("");

              if (textContent) {
                content.push({
                  type: "text",
                  text: textContent,
                });
              }
            }

            // Add image attachments
            attachments.forEach((att) => {
              if (att.type.startsWith("image/")) {
                content.push({
                  type: "image_url",
                  image_url: {
                    url: att.url,
                  },
                });
              } else {
                // For non-image files, add as text with link
                content.push({
                  type: "text",
                  text: `[Attachment: ${att.name} (${att.type})](${att.url})`,
                });
              }
            });

            return {
              role: msg.role,
              content: content,
            };
          } else {
            // Use regular text format for messages without attachments
            let textContent = "";

            // First try to get content from the content property
            if (msg.content && msg.content.trim()) {
              textContent = msg.content.trim();
            }
            // If content is empty, try to extract from parts
            else if (msg.parts && msg.parts.length > 0) {
              textContent = msg.parts
                .filter((part) => part.type === "text")
                .map((part) => {
                  if (part.type === "text" && "text" in part) {
                    return part.text?.trim() || "";
                  }
                  return "";
                })
                .filter((text) => text.length > 0)
                .join("");
            }

            return {
              role: msg.role,
              content: textContent,
            };
          }
        });

        // Filter out messages with empty content and non-conversation roles
        const validMessages = apiMessages.filter(
          (msg) =>
            msg.role !== "data" &&
            msg.content &&
            (typeof msg.content === "string"
              ? msg.content.trim().length > 0
              : Array.isArray(msg.content) && msg.content.length > 0)
        ) as { role: "system" | "user" | "assistant"; content: string }[];

        setStatus("streaming");

        // Call the streaming endpoint
        const response = await client.chat.streamCompletion.$post(
          {
            messages: validMessages,
            model: selectedModel,
          },
          {
            headers: {
              [modelConfig.headerKey]: apiKey,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        const assistantMessage: UIMessage = {
          id: uuidv4(),
          role: "assistant",
          content: "",
          parts: [{ type: "text", text: "" }],
          createdAt: new Date(),
        };

        // Add assistant message to state
        setMessages((prev) => [...prev, assistantMessage]);

        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // console.log(
            //   "✅ Stream done, final content length:",
            //   accumulatedContent.length
            // );
            break;
          }
          if (controller.signal.aborted) break;

          const chunk = decoder.decode(value, { stream: true });
          // console.log("📦 Raw chunk received:", chunk);

          const lines = chunk.split("\n");
          // console.log("📄 Lines in chunk:", lines);

          for (const line of lines) {
            // console.log("🔍 Processing line:", line);

            // Handle AI SDK streaming format
            if (line.startsWith("0:")) {
              // Text chunk format: 0:"content"
              try {
                const textContent = line.slice(2); // Remove '0:' prefix
                const parsedContent = JSON.parse(textContent); // Parse the quoted string

                accumulatedContent += parsedContent;
                // console.log("✨ SUCCESS: Added text content:", parsedContent);
                // console.log("📚 Total accumulated:", accumulatedContent);

                // Update the assistant message
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  const lastMessage = newMessages[lastIndex];

                  if (lastMessage && lastMessage.role === "assistant") {
                    // Create completely new object to trigger React re-render
                    const updatedMessage = {
                      ...lastMessage,
                      content: accumulatedContent,
                      parts: [{ type: "text", text: accumulatedContent }],
                      // Mark as not final during streaming
                      isFinalMessage: false
                    };
                    
                    newMessages[lastIndex] = {
                      ...updatedMessage,
                      parts: updatedMessage.parts.map(part => ({
                        type: "text" as const,
                        text: part.text
                      }))
                    };
                    
                    // Broadcast the updated AI message to other tabs
                    // Use a small delay to throttle broadcasts and prevent UI glitches
                    // This creates smoother streaming across tabs
                    const currentTime = Date.now();
                    // Only broadcast every 200ms to avoid overwhelming the channel
                    // Increased from 100ms to 200ms for better performance
                    if (!lastBroadcastTime.current || currentTime - lastBroadcastTime.current >= 200) {
                      lastBroadcastTime.current = currentTime;
                      
                      // Clone the message to avoid reference issues
                      const messageToSend = {
                        ...updatedMessage,
                        parts: updatedMessage.parts.map(part => ({
                          type: "text" as const,
                          text: part.text
                        })),
                        isFinalMessage: false // Explicitly mark as not final
                      };
                      
                      broadcastNewMessage(messageToSend);
                    }
                    
                    // console.log(
                    //   "🔄 Updated assistant message:",
                    //   newMessages[lastIndex]
                    // );
                  } else {
                    console.warn(
                      "⚠️ Last message is not assistant:",
                      lastMessage
                    );
                  }
                  return newMessages;
                });
              } catch (error) {
                console.warn("⚠️ Failed to parse text chunk:", line, error);
              }
            } else if (line.startsWith("e:")) {
              // End/finish data: e:{"finishReason":"stop",...}
              // console.log("🏁 Received finish signal:", line);
            } else if (line.startsWith("d:")) {
              // Done data: d:{"finishReason":"stop",...}
              // console.log("✅ Received done signal:", line);
              break; // Exit the loop when done
            } else if (line.trim() === "") {
              // Empty line, skip
              continue;
            } else {
              // console.log("⏭️ Unknown line format:", line);
            }
          }
        }

        // Ensure final message state is set after streaming completes
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;

          if (newMessages[lastIndex]?.role === "assistant") {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: accumulatedContent,
              parts: [{ type: "text", text: accumulatedContent }],
            };
          }
          return newMessages;
        });

        // Save the completed assistant message to database
        const finalAssistantMessage: UIMessage = {
          ...assistantMessage,
          content: accumulatedContent,
          parts: [{ type: "text", text: accumulatedContent }],
          // Add a flag to indicate this is the final complete message
        //  isFinalMessage: true
        };
        await saveAssistantMessage(finalAssistantMessage);
        
        // Broadcast the final assistant message to other tabs
        // Reset the throttling timer to ensure the final message is always sent
        lastBroadcastTime.current = null;
        
        // Ensure the final message is broadcast with a slight delay
        // This helps ensure it's processed after any in-flight streaming updates
        setTimeout(() => {
          broadcastNewMessage(finalAssistantMessage);
        }, 100);

        setStatus("ready");
      } catch (err) {
        console.error("Chat error:", err);
        setError(err as Error);
        setStatus("error");
        toast.error("Failed to send message");
      } finally {
        setAbortController(null);
      }
    },
    [
      messages,
      status,
      selectedModel,
      modelConfig,
      getKey,
      threadId,
      addThread,
      saveUserMessage,
      saveAssistantMessage,
      saveChatTitle,
      onMessageSubmit,
    ]
  );

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setStatus("ready");
    }
  }, [abortController]);

  const reload = useCallback(() => {
    // console.log("🔄 Chat: Reload function called");
    // console.log("📊 Chat: Current messages state:", {
    //   totalMessages: messages.length,
    //   messageIds: messages.map((m) => ({ id: m.id, role: m.role })),
    // });

    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      // console.log("👤 Chat: Found last user message:", {
      //   messageId: lastUserMessage?.id,
      //   content: lastUserMessage?.content?.substring(0, 50) + "...",
      // });

      if (lastUserMessage) {
        // Remove the last assistant message if it exists
        const newMessages = messages.filter((_, index) => {
          const isLastAssistant =
            index === messages.length - 1 &&
            messages[index]?.role === "assistant";
          return !isLastAssistant;
        });

        // console.log("🗑️ Chat: Filtered messages for reload:", {
        //   originalCount: messages.length,
        //   filteredCount: newMessages.length,
        //   removedLastAssistant: messages.length !== newMessages.length,
        // });

        setMessages(newMessages);
        // console.log("📤 Chat: Calling append with last user message");
        append(lastUserMessage);
      }
    }
  }, [messages, append]);

  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        <div className="relative w-full">
          <div className="flex h-screen">
            <main
              ref={mainContainerRef}
              className="flex flex-col w-full max-w-3xl pt-10 pb-44 mx-auto transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar"
            >
              {/* Add the BranchNavigator */}
              <div className="mb-6">
                <BranchNavigator currentChatId={threadId} />
              </div>

              <Messages
                threadId={threadId}
                messages={messages}
                status={status}
                setMessages={setMessages}
                reload={reload}
                error={error}
                registerRef={registerRef}
                stop={stop}
                onBranch={handleBranch}
              />
              <div ref={messagesEndRef} className="h-32" />
              <ChatInput
                threadId={threadId}
                input={input}
                status={status}
                append={append}
                setInput={setInput}
                stop={stop}
                saveChatTitle={saveChatTitle}
                isNewChat={messages.length === 0}
              />
            </main>
          </div>
          {showScrollIndicator && (
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-32 right-4 md:right-8 z-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
          <div className="fixed top-4 right-4 flex items-center gap-2 z-20">
            {/* Add the ChatVisibilityToggle here */}
            {user && currentChat && (
              <ChatVisibilityToggle
                chatUuid={threadId}
                userId={user.id}
                initialIsPublic={currentChat.isPublic || false}
              />
            )}
            <ThemeToggler />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
