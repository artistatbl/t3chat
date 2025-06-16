"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UIMessage } from "ai";

export function useConvexChat(threadId: string) {
  const { user } = useUser();
  const createChat = useMutation(api.chats.createChat);
  const createMessage = useMutation(api.messages.createMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  
  // Fix: Only call the query when threadId is valid
  const getChat = useQuery(
    api.chats.getChatByUuid, 
    threadId ? { uuid: threadId } : "skip"
  );
  
  const getMessages = useQuery(
    api.messages.getMessagesByChat, 
    threadId ? { chatId: threadId } : "skip"
  );

  const saveUserMessage = async (message: UIMessage, shouldGenerateTitle = false) => {
    if (!user || !threadId) return;
  
    try {
      // Check if chat already exists using the query result
      if (!getChat) {
        // Chat doesn't exist, create it
        if (shouldGenerateTitle) {
          try {
            // Generate a simple title from the message content
            const words = message.content.trim().split(' ').slice(0, 6);
            const generatedTitle = words.join(' ') + (message.content.split(' ').length > 6 ? '...' : '');
            
            // Create chat with generated title
            await createChat({
              uuid: threadId,
              userId: user.id,
              title: generatedTitle || "New Chat",
            });
          } catch (titleError) {
            console.warn("Failed to generate title, using default:", titleError);
            // Fallback to creating chat with default title
            await createChat({
              uuid: threadId,
              userId: user.id,
              title: "New Chat",
            });
          }
        } else {
          // Create chat with default title
          await createChat({
            uuid: threadId,
            userId: user.id,
            title: "New Chat",
          });
        }
      }

      // Check for attachments
      const attachments = (message as unknown as { attachments?: { name: string; url: string; type: string }[] }).attachments;

      // Save user message
      await createMessage({
        uuid: message.id,
        chatId: threadId,
        userId: user.id,
        role: message.role,
        content: message.content,
        attachments: attachments || undefined,
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
    }
  };

  const saveAssistantMessage = async (message: UIMessage) => {
    if (!user || !threadId) return;

    try {
      await createMessage({
        uuid: message.id,
        chatId: threadId,
        userId: user.id,
        role: message.role,
        content: message.content,
      });
    } catch (error) {
      console.error("Failed to save assistant message:", error);
    }
  };

  const saveChatTitle = async (title: string) => {
    if (!user || !threadId) return;
  
    try {
      console.log("[saveChatTitle] Attempting to save title:", { threadId, title });
      
      // Check if chat exists first
      const existingChat = getChat;
      
      if (!existingChat) {
        // Chat doesn't exist, create it with the title
        console.log("[saveChatTitle] Chat doesn't exist, creating with title:", title);
        await createChat({
          uuid: threadId,
          userId: user.id,
          title: title,
        });
      } else {
        // Chat exists, update the title
        console.log("[saveChatTitle] Chat exists, updating title from", existingChat.title, "to", title);
        const result = await updateChatTitle({
          uuid: threadId,
          title: title,
        });
        console.log("[saveChatTitle] Successfully updated title:", result);
      }
    } catch (error) {
      console.error("Failed to save chat title:", error);
    }
  };

  const createChatWithTitle = async (title: string) => {
    if (!user || !threadId) return;
  
    try {
      console.log("[createChatWithTitle] Creating chat with title:", { uuid: threadId, title });
      await createChat({
        uuid: threadId,
        userId: user.id,
        title: title,
      });
      console.log("[createChatWithTitle] Successfully created chat with title");
    } catch (error) {
      console.error("Failed to create chat with title:", error);
    }
  };
  
  return {
    saveUserMessage,
    saveAssistantMessage,
    saveChatTitle,
    createChatWithTitle,
    chat: getChat,
    messages: getMessages,
  };
}