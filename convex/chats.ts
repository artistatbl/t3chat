import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    isPublic: v.optional(v.boolean()), // Add this field
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (existingChat) {
      return existingChat;
    }

    const now = Date.now();
    return await ctx.db.insert("chats", {
      uuid: args.uuid,
      userId: args.userId,
      title: args.title || "New Chat",
      isPublic: args.isPublic ?? false, // Default to private
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateChatTitle = mutation({
  args: {
    uuid: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[updateChatTitle] Received:", { uuid: args.uuid, title: args.title });
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      console.log("[updateChatTitle] Chat not found for uuid:", args.uuid);
      throw new Error("Chat not found");
    }

    console.log("[updateChatTitle] Found chat:", chat);
    
    await ctx.db.patch(chat._id, {
      title: args.title,
      updatedAt: Date.now(),
    });
    
    console.log("[updateChatTitle] Updated chat with title:", args.title);
    
    return chat;
  },
});

export const getChatByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
    
    if (!chat) {
      return null;
    }
    
    // Allow access if:
    // 1. Chat is public, OR
    // 2. User is authenticated and owns the chat
    const userId = identity?.subject;
    const canAccess = chat.isPublic || (userId && chat.userId === userId);
    
    return canAccess ? chat : null;
  },
});

export const getChatsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getPublicChats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();
  },
});

export const deleteChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own chats");
    }

    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(chat._id);

    return { success: true };
  },
});

export const toggleChatPinned = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only pin your own chats");
    }

    // Toggle the pinned status
    await ctx.db.patch(chat._id, {
      pinned: !chat.pinned,
      updatedAt: Date.now(),
    });

    return { success: true, pinned: !chat.pinned };
  },
});

export const updateChatVisibility = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only modify your own chats");
    }

    await ctx.db.patch(chat._id, {
      isPublic: args.isPublic,
      updatedAt: Date.now(),
    });

    return { success: true, isPublic: args.isPublic };
  },
});