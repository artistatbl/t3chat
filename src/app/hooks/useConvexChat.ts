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
    getChat ? { chatId: getChat.uuid } : "skip"
  );

  const saveUserMessage = async (message: UIMessage) => {
    if (!user || !threadId) return;

    try {
      // Ensure chat exists
      await createChat({
        uuid: threadId,
        userId: user.id,
      });

      // Save user message
      await createMessage({
        uuid: message.id,
        chatId: threadId,
        userId: user.id,
        role: message.role,
        content: message.content,
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
    }
  };

  const saveAssistantMessage = async (message: UIMessage) => {
    if (!user || !threadId) return;

    try {
      // Save assistant message
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
      await updateChatTitle({
        uuid: threadId,
        title,
      });
    } catch (error) {
      console.error("Failed to save chat title:", error);
    }
  };

  return {
    saveUserMessage,
    saveAssistantMessage,
    saveChatTitle,
    chat: getChat,
    messages: getMessages, // Add this line
  };
}